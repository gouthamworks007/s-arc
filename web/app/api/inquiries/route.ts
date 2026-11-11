import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";

/**
 * GET /api/inquiries
 * Retrieves consultation requests with strict role-based isolation:
 * - Admin: sees all consultations
 * - Architect: sees only inquiries for projects created by their studio
 * - Homeowner: sees only inquiries submitted under their verified account email
 */
export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) {
    return (
      errorResponse ||
      NextResponse.json(
        { error: "Authentication required to view consultations." },
        { status: 401 }
      )
    );
  }

  try {
    let sql = `
      SELECT 
        i.id, 
        i.client_name AS clientName, 
        i.client_email AS clientEmail, 
        i.client_phone AS clientPhone, 
        i.project_name AS projectName, 
        i.project_id AS projectId, 
        i.plot_location AS plotLocation, 
        i.plot_dimensions AS plotDimensions, 
        i.budget_range AS budgetRange, 
        i.message, 
        i.status, 
        i.reply_text AS replyText, 
        i.created_at AS date 
      FROM inquiries i
    `;
    const params: any[] = [];

    if (user.role === "admin") {
      // Admins see all inquiries
      sql += " ORDER BY i.created_at DESC";
    } else if (user.subRole === "architect") {
      // Architects only see inquiries for their projects (or submitted by them)
      sql += `
        LEFT JOIN projects p ON (i.project_id = p.id OR i.project_id = p.slug)
        WHERE p.architect_id = ? OR lower(i.client_email) = lower(?)
        ORDER BY i.created_at DESC
      `;
      params.push(user.id, user.email);
    } else {
      // Homeowners only see inquiries they submitted
      sql += " WHERE lower(i.client_email) = lower(?) ORDER BY i.created_at DESC";
      params.push(user.email);
    }

    const rows = await d1.query(sql, params);

    const inquiries = rows.map((i: any) => ({
      id: i.id,
      clientName: i.clientName || i.client_name,
      clientEmail: i.clientEmail || i.client_email,
      clientPhone: i.clientPhone || i.client_phone,
      projectName: i.projectName || i.project_name,
      projectId: i.projectId || i.project_id,
      plotLocation: i.plotLocation || i.plot_location,
      plotDimensions: i.plotDimensions || i.plot_dimensions,
      budgetRange: i.budgetRange || i.budget_range,
      message: i.message,
      status: i.status,
      replyText: i.replyText || i.reply_text,
      date: i.date || i.created_at,
    }));

    return NextResponse.json({
      total: inquiries.length,
      inquiries,
    });
  } catch (err: any) {
    console.error("D1 inquiries query error:", err);
    return NextResponse.json(
      { error: "Failed to fetch inquiries from Cloudflare D1" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inquiries
 * Submits a new architectural consultation request.
 * Strictly requires authentication to prevent spoofing and spam.
 */
export async function POST(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) {
    return (
      errorResponse ||
      NextResponse.json(
        { error: "Authentication required to submit consultation requests. Please sign in." },
        { status: 401 }
      )
    );
  }

  try {
    const body = await req.json();
    const {
      clientName,
      clientEmail,
      clientPhone,
      projectName,
      projectId,
      plotLocation,
      plotDimensions,
      budgetRange,
      message,
    } = body;

    // Server-side validation
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a detailed inquiry message (minimum 5 characters)." },
        { status: 400 }
      );
    }

    // Force clientEmail to authenticated user to prevent identity spoofing
    const verifiedEmail = user.email.toLowerCase().trim();
    const verifiedName = (clientName && typeof clientName === "string" && clientName.trim()) 
      ? clientName.trim().slice(0, 100) 
      : user.name;

    const cleanMessage = message.trim().slice(0, 2000);
    const cleanProjectId = projectId ? String(projectId).trim() : null;

    // Duplicate Prevention: check if identical active inquiry was submitted within the last 15 minutes
    if (cleanProjectId) {
      const duplicate = await d1.first(
        `SELECT id FROM inquiries 
         WHERE lower(client_email) = lower(?) 
           AND project_id = ? 
           AND message = ? 
           AND status != 'completed' 
         LIMIT 1`,
        [verifiedEmail, cleanProjectId, cleanMessage]
      );

      if (duplicate) {
        return NextResponse.json(
          { error: "You have already submitted an inquiry with these specifications to this studio." },
          { status: 409 }
        );
      }
    }

    const newId = `inq-${Date.now().toString().slice(-6)}`;

    await d1.execute(
      `INSERT INTO inquiries (
        id, client_name, client_email, client_phone, project_name, project_id,
        plot_location, plot_dimensions, budget_range, message, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        verifiedName,
        verifiedEmail,
        clientPhone ? String(clientPhone).trim().slice(0, 30) : null,
        projectName ? String(projectName).trim().slice(0, 120) : "Architectural Consultation",
        cleanProjectId,
        plotLocation ? String(plotLocation).trim().slice(0, 100) : "Kerala",
        plotDimensions ? String(plotDimensions).trim().slice(0, 100) : "Standard Plot",
        budgetRange ? String(budgetRange).trim().slice(0, 50) : "Flexible",
        cleanMessage,
        "new",
      ]
    );

    const newInquiry = {
      id: newId,
      clientName: verifiedName,
      clientEmail: verifiedEmail,
      clientPhone: clientPhone || null,
      projectName: projectName || "Architectural Consultation",
      projectId: cleanProjectId,
      plotLocation: plotLocation || "Kerala",
      plotDimensions: plotDimensions || "Standard Plot",
      budgetRange: budgetRange || "Flexible",
      message: cleanMessage,
      status: "new",
      date: "Just now",
    };

    return NextResponse.json(
      {
        success: true,
        message: "Consultation request successfully registered with architect studio via Cloudflare D1.",
        inquiry: newInquiry,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("D1 inquiry creation error:", err);
    return NextResponse.json(
      { error: "Failed to submit inquiry to Cloudflare D1" },
      { status: 500 }
    );
  }
}
