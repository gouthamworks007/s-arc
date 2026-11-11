import { NextRequest, NextResponse } from "next/server";
import { requireVerifiedArchitect } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Allowed extensions per category
const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  plans: [".png", ".jpg", ".jpeg", ".webp", ".svg", ".pdf"],
  imagery: [".png", ".jpg", ".jpeg", ".webp", ".svg"],
  cad: [".dwg", ".dxf", ".pdf", ".zip", ".rar", ".bim", ".rvt", ".ifc", ".skp", ".xlsx", ".csv"],
  documents: [".pdf", ".zip", ".dwg", ".dxf", ".docx", ".xlsx"],
};

// Size limits in bytes
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_CAD_SIZE = 100 * 1024 * 1024; // 100 MB

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export async function POST(req: NextRequest) {
  // 1. Authorization: Only Verified Architects or Admins can upload blueprint assets
  const { user, errorResponse } = await requireVerifiedArchitect(req);
  if (errorResponse) return errorResponse;

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawCategory = (formData.get("category") as string) || "plans";
    const category = ["plans", "imagery", "cad", "documents"].includes(rawCategory)
      ? rawCategory
      : "plans";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No file was uploaded. Please select an architectural plan or drawing file." },
        { status: 400 }
      );
    }

    const originalName = file.name || "unnamed-file";
    const extension = path.extname(originalName).toLowerCase();

    // 2. Validate Extension
    const allowed = ALLOWED_EXTENSIONS[category] || ALLOWED_EXTENSIONS.plans;
    if (!allowed.includes(extension)) {
      return NextResponse.json(
        {
          error: `Invalid file format (${extension}). Allowed formats for ${category}: ${allowed.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 3. Validate File Size
    const isCad = category === "cad" || [".dwg", ".dxf", ".zip", ".rar", ".bim", ".rvt"].includes(extension);
    const maxSize = isCad ? MAX_CAD_SIZE : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File is too large (${formatBytes(file.size)}). Maximum allowed size is ${formatBytes(maxSize)}.`,
        },
        { status: 400 }
      );
    }

    // 4. Sanitize Filename and Create Unique Identifier
    const sanitizedBase = path
      .basename(originalName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);

    const uniqueFilename = `${Date.now()}-${sanitizedBase}${extension}`;

    // Target upload folder in public/uploads/<category>
    const uploadsDir = path.join(process.cwd(), "public", "uploads", category);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const targetFilePath = path.join(uploadsDir, uniqueFilename);
    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.promises.writeFile(targetFilePath, buffer);

    const publicUrl = `/uploads/${category}/${uniqueFilename}`;
    const formattedSize = formatBytes(file.size);

    // 5. Audit Log the upload event in Cloudflare D1
    try {
      await d1.execute(
        `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `aud-${Date.now()}`,
          user.id,
          user.name,
          user.email,
          user.role,
          "UPLOAD_ARCHITECTURAL_FILE",
          uniqueFilename,
          "file",
          JSON.stringify({
            category,
            originalName,
            storedUrl: publicUrl,
            size: formattedSize,
            extension,
          }),
        ]
      );
    } catch (auditErr) {
      console.warn("Audit logging failed for file upload:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "Architectural plan file uploaded successfully.",
      url: publicUrl,
      fileName: originalName,
      originalName: originalName,
      fileSize: formattedSize,
      formattedSize: formattedSize,
      fileSizeBytes: file.size,
      fileType: file.type || extension,
      category,
    });
  } catch (err: any) {
    console.error("Upload handler error:", err);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}
