import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";

const INQUIRIES_STORE = [
  {
    id: "inq-001",
    clientName: "Adv. K. Ramesh & Sunitha",
    clientEmail: "ramesh.legal@gmail.com",
    clientPhone: "+91 94470 55122",
    projectName: "The Ridge House",
    projectId: "ridge-house",
    plotLocation: "Wayanad, Kerala (Sloping Terrain)",
    plotDimensions: "55ft x 92ft (11.5 Cents)",
    budgetRange: "₹85L - ₹1.1 Cr",
    message: "We love the cantilevered deck and central water court of The Ridge House. Our plot has an 8-degree slope facing North-East. Can this plan be adapted with minimal retaining wall work?",
    date: "Today, 10:45 AM",
    status: "new",
  },
  {
    id: "inq-002",
    clientName: "Dr. Ananya Menon",
    clientEmail: "ananya.menon.cardio@amrita.edu",
    clientPhone: "+91 98950 14890",
    projectName: "Kerala Courtyard",
    projectId: "kerala-courtyard",
    plotLocation: "Thrissur town (East-Facing)",
    plotDimensions: "62ft x 98ft (14 Cents)",
    budgetRange: "₹1.2 Cr - ₹1.5 Cr",
    message: "Interested in the complete 42-sheet CAD + Structural BOQ package. We want to verify if the puja room placement matches strict Padavinyasa Vastu for East orientation.",
    date: "Yesterday",
    status: "responded",
    replyText: "Dr. Menon, thank you! The Kerala Courtyard is 100% compliant with Padavinyasa Vastu grid principles. I've sent the orientation diagram to your email.",
  },
];

export async function GET(req: NextRequest) {
  const { user } = await authenticateRequest(req);

  return NextResponse.json({
    total: INQUIRIES_STORE.length,
    inquiries: INQUIRIES_STORE,
  });
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

    const newInquiry = {
      id: `inq-${Date.now().toString().slice(-4)}`,
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

    INQUIRIES_STORE.unshift(newInquiry);

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry delivered to verified architect studio.",
        inquiry: newInquiry,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}

