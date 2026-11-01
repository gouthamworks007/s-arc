import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-middleware";

// In-memory mock sync fallback
const USERS_STORE: any[] = [
  {
    id: "usr-super-01",
    name: "Vikram Sarabhai",
    email: "superadmin@s-arc.in",
    role: "super_admin",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    phone: "+91 98400 99999",
    location: "Bengaluru, Karnataka",
    joinedDate: "Jan 2025",
  },
  {
    id: "usr-admin-01",
    name: "Sarah Thomas",
    email: "sarah.admin@s-arc.in",
    role: "admin",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    phone: "+91 94471 22334",
    location: "Kochi, Kerala",
    joinedDate: "Mar 2025",
  },
  {
    id: "usr-arch-01",
    name: "Ar. Nikhil Rajan",
    email: "nikhil@studiovayu.arch",
    role: "user",
    subRole: "architect",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    phone: "+91 98471 28910",
    location: "Kochi, Kerala",
    studioName: "Studio Vayu",
    coaNumber: "CA/2016/78291",
    joinedDate: "Feb 2025",
  },
  {
    id: "usr-arch-02",
    name: "Ar. Sneha Philip",
    email: "sneha.design@gmail.com",
    role: "user",
    subRole: "architect",
    status: "pending_verification",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    phone: "+91 94460 77889",
    location: "Calicut, Kerala",
    studioName: "Philip Habitat Design",
    coaNumber: "CA/2023/94102",
    joinedDate: "Yesterday",
  },
  {
    id: "usr-client-01",
    name: "Adv. K. Ramesh",
    email: "ramesh.client@gmail.com",
    role: "user",
    subRole: "homeowner",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    phone: "+91 94470 55122",
    location: "Wayanad, Kerala",
    joinedDate: "Jun 2025",
  },
];

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await requireRole(req, ["super_admin", "admin"]);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const roleFilter = url.searchParams.get("role");
  const search = url.searchParams.get("q")?.toLowerCase();

  let results = USERS_STORE;

  if (roleFilter && roleFilter !== "all") {
    results = results.filter((u) => u.role === roleFilter);
  }

  if (search) {
    results = results.filter(
      (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    total: results.length,
    users: results,
  });
}

export async function POST(req: NextRequest) {
  // Only Super Admin can appoint new admins
  const { user, errorResponse } = await requireRole(req, ["super_admin"]);
  if (errorResponse) return errorResponse;

  const body = await req.json();
  const { name, email, role = "admin", location = "Kochi, Kerala" } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required to create an admin account." },
      { status: 400 }
    );
  }

  const newAdmin = {
    id: `usr-admin-${Date.now().toString().slice(-4)}`,
    name,
    email,
    role,
    status: "active",
    location,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    joinedDate: "Just now",
  };

  USERS_STORE.unshift(newAdmin);

  return NextResponse.json(
    {
      success: true,
      message: `Admin appointment confirmed for ${name}`,
      user: newAdmin,
    },
    { status: 201 }
  );
}
