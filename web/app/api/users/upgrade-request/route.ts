import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) {
    return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { practiceType = "freelance", studioName, coaNumber, phone, location, portfolioUrl, bio } = body;

    if (!coaNumber || !studioName) {
      return NextResponse.json(
        { error: "Council of Architecture (CoA) number and Studio/Firm name are required." },
        { status: 400 }
      );
    }

    const cleanCoa = coaNumber.trim().toUpperCase();
    const reviewNote = `Application submitted for ${practiceType === "agency" ? "Architecture Firm / Agency" : "Freelance Architect"}. CoA: ${cleanCoa}. Studio: ${studioName}. Awaiting Admin verification.`;

    // Update user record in Cloudflare D1
    await d1.execute(
      `UPDATE users SET 
        sub_role = 'architect',
        status = 'pending_verification',
        coa_number = ?,
        studio_name = ?,
        phone = COALESCE(?, phone),
        location = COALESCE(?, location),
        bio = COALESCE(?, bio),
        review_notes = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [cleanCoa, studioName.trim(), phone || null, location || null, bio || null, reviewNote, user.id]
    );

    // Record audit log in Cloudflare D1
    await d1.execute(
      `INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, actor_role, action, target_id, target_type, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud-${Date.now()}`,
        user.id,
        user.name,
        user.email,
        "user",
        "APPLY_ARCHITECT_UPGRADE",
        user.id,
        "user",
        JSON.stringify({ practiceType, studioName, coaNumber: cleanCoa, portfolioUrl, location }),
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully. It is now awaiting Admin verification.",
      application: {
        userId: user.id,
        practiceType,
        studioName,
        coaNumber: cleanCoa,
        status: "pending_verification",
      },
    });
  } catch (err: any) {
    console.error("Upgrade request error:", err);
    return NextResponse.json({ error: "Failed to submit upgrade application" }, { status: 500 });
  }
}

