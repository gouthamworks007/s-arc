import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { d1 } from "@/lib/d1";

export async function GET(req: NextRequest) {
  const { user } = await authenticateRequest(req);

  try {
    const rows = await d1.query(
      `SELECT 
        id, 
        client_name AS clientName, 
        client_email AS clientEmail, 
        client_phone AS clientPhone, 
        project_name AS projectName, 
        project_id AS projectId, 
        plot_location AS plotLocation, 
        plot_dimensions AS plotDimensions, 
        budget_range AS budgetRange, 
        message, 
        status, 
        reply_text AS replyText, 
        created_at AS date 
      FROM inquiries 
      ORDER BY created_at DESC`
    );

    return NextResponse.json({
      total: rows.length,
      inquiries: rows,
    });
  } catch (err: any) {
    console.error("D1 inquiries query error:", err);
    return NextResponse.json({ error: "Failed to fetch inquiries from Cloudflare D1" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, clientEmail, projectName, message } = body;

    if (!clientName || !clientEmail || !message) {
      return NextResponse.json(
        { error: "Client name, email, and message are required." },
        { status: 400 }
      );
    }

    const newId = `inq-${Date.now().toString().slice(-4)}`;

    await d1.execute(
      `INSERT INTO inquiries (
        id, client_name, client_email, client_phone, project_name, project_id,
        plot_location, plot_dimensions, budget_range, message, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        clientName,
        clientEmail,
        body.clientPhone || null,
        projectName || "Architectural Consultation",
        body.projectId || null,
        body.plotLocation || "Kerala",
        body.plotDimensions || "Standard Plot",
        body.budgetRange || "Flexible",
        message,
        "new",
      ]
    );

    const newInquiry = {
      id: newId,
      clientName,
      clientEmail,
      clientPhone: body.clientPhone || null,
      projectName: projectName || "Architectural Consultation",
      projectId: body.projectId || null,
      plotLocation: body.plotLocation || "Kerala",
      plotDimensions: body.plotDimensions || "Standard Plot",
      budgetRange: body.budgetRange || "Flexible",
      message,
      status: "new",
      date: "Just now",
    };

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry registered and delivered to architect studio via Cloudflare D1.",
        inquiry: newInquiry,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("D1 inquiry creation error:", err);
    return NextResponse.json({ error: "Failed to submit inquiry to Cloudflare D1" }, { status: 500 });
  }
}
