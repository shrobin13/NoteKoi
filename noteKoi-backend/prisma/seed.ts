import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma.js";
import { Role, VerificationStatus, AdminRole } from "../generated/prisma/index.js";
import { env } from "../src/config/index.js";

async function main() {
  console.log("🌱 Starting Super Admin Seeder...");

  const adminName = process.env.SUPER_ADMIN_NAME || "Super Admin";
  const adminEmail = (process.env.SUPER_ADMIN_EMAIL || "admin@notekoi.com").toLowerCase().trim();
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin123!";

  // 1. Ensure at least one college exists for mandatory User.collegeId relation
  let systemCollege = await prisma.college.findFirst();

  if (!systemCollege) {
    console.log("🏫 No college found. Creating default system college...");
    systemCollege = await prisma.college.create({
      data: {
        name: "System Administration College",
      },
    });
    console.log(`✅ Default college created with ID: ${systemCollege.id}`);
  }

  // 2. Check if Super Admin user already exists by email or OWNER_ADMIN role
  let ownerAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { role: Role.OWNER_ADMIN },
      ],
    },
  });

  const passwordHash = await bcrypt.hash(adminPassword, env.BCRYPT_SALT_ROUNDS);

  if (ownerAdmin) {
    console.log(`ℹ️ Super Admin user found (${ownerAdmin.email}). Updating details...`);
    ownerAdmin = await prisma.user.update({
      where: { id: ownerAdmin.id },
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: Role.OWNER_ADMIN,
        verificationStatus: VerificationStatus.VERIFIED,
        collegeId: ownerAdmin.collegeId || systemCollege.id,
      },
    });
  } else {
    console.log(`👤 Creating new Super Admin user (${adminEmail})...`);
    ownerAdmin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: Role.OWNER_ADMIN,
        verificationStatus: VerificationStatus.VERIFIED,
        collegeId: systemCollege.id,
      },
    });
  }

  // 3. Ensure active AdminAssignment entry for OWNER_ADMIN exists
  const existingAssignment = await prisma.adminAssignment.findFirst({
    where: {
      userId: ownerAdmin.id,
      role: AdminRole.OWNER_ADMIN,
      isActive: true,
    },
  });

  if (!existingAssignment) {
    console.log("🔑 Creating active OWNER_ADMIN AdminAssignment...");
    await prisma.adminAssignment.create({
      data: {
        userId: ownerAdmin.id,
        role: AdminRole.OWNER_ADMIN,
        collegeId: null, // Platform-wide Owner Admin has null collegeId in assignment
        isActive: true,
        assignedById: ownerAdmin.id, // Self-assigned for initial seed
      },
    });
  }

  console.log("\n🎉 Super Admin Seeding Completed Successfully!");
  console.log("───────────────────────────────────────────");
  console.log(`  Name:     ${ownerAdmin.name}`);
  console.log(`  Email:    ${ownerAdmin.email}`);
  console.log(`  Role:     ${ownerAdmin.role}`);
  console.log(`  Password: ${adminPassword}`);
  console.log("───────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    // End process
  });
