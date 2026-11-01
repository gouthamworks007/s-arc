import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Starting S-ARC PostgreSQL Database Seeding...");

  if (!prisma) {
    console.log("⚠️ Prisma client not generated yet. Run 'npx prisma generate' after configuring PostgreSQL.");
    return;
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Super Admin
  await prisma.user.upsert({
    where: { email: "superadmin@s-arc.in" },
    update: {},
    create: {
      name: "Vikram Sarabhai",
      email: "superadmin@s-arc.in",
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      location: "Bengaluru, Karnataka",
      phone: "+91 98400 99999",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      permissions: ["all", "manage_admins", "manage_finances", "system_settings"],
    },
  });

  // 2. Platform Admin
  await prisma.user.upsert({
    where: { email: "sarah.admin@s-arc.in" },
    update: {},
    create: {
      name: "Sarah Thomas",
      email: "sarah.admin@s-arc.in",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      location: "Kochi, Kerala",
      phone: "+91 94471 22334",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      permissions: ["verify_architects", "moderate_listings", "manage_users"],
    },
  });

  // 3. Verified Architect
  await prisma.user.upsert({
    where: { email: "nikhil@studiovayu.arch" },
    update: {},
    create: {
      name: "Ar. Nikhil Rajan",
      email: "nikhil@studiovayu.arch",
      passwordHash,
      role: "USER",
      subRole: "ARCHITECT",
      status: "ACTIVE",
      studioName: "Studio Vayu",
      coaNumber: "CA/2016/78291",
      location: "Kochi, Kerala",
      phone: "+91 98471 28910",
      bio: "Pioneering climate-responsive tropical minimalism across South India.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
  });

  // 4. Client Homeowner
  await prisma.user.upsert({
    where: { email: "ramesh.client@gmail.com" },
    update: {},
    create: {
      name: "Adv. K. Ramesh",
      email: "ramesh.client@gmail.com",
      passwordHash,
      role: "USER",
      subRole: "HOMEOWNER",
      status: "ACTIVE",
      location: "Wayanad, Kerala",
      phone: "+91 94470 55122",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    },
  });

  // 5. Initial Platform Settings
  await prisma.platformSetting.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      platformCommissionPercent: 10.0,
      autoApproveVerifiedArchitects: false,
      maintenanceMode: false,
      minListingPrice: 25000.0,
      payoutEscrowHoldDays: 7,
    },
  });

  console.log("✅ Seed completed successfully with 3-tier users and system settings!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma && prisma.$disconnect) {
      await prisma.$disconnect();
    }
  });
