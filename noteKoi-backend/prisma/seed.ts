import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma.js";
import { Role, VerificationStatus, AdminRole } from "@prisma/client";
import { env } from "../src/config/index.js";

async function ensureSeedHierarchy(collegeName: string) {
  let college = await prisma.college.findFirst({ where: { name: collegeName } });
  if (!college) {
    console.log(`🏫 Creating college "${collegeName}"...`);
    college = await prisma.college.create({ data: { name: collegeName } });
  }

  let department = await prisma.department.findFirst({
    where: { collegeId: college.id, name: "Computer Science" },
  });
  if (!department) {
    console.log(`🏛️ Creating department "Computer Science" under ${college.name}...`);
    department = await prisma.department.create({
      data: { name: "Computer Science", collegeId: college.id },
    });
  }

  let semester = await prisma.semester.findFirst({
    where: { departmentId: department.id, name: "Fall 2026" },
  });
  if (!semester) {
    console.log(`📚 Creating semester "Fall 2026"...`);
    semester = await prisma.semester.create({
      data: { name: "Fall 2026", departmentId: department.id },
    });
  }

  let course = await prisma.course.findFirst({
    where: { semesterId: semester.id, name: "Introduction to Computing" },
  });
  if (!course) {
    console.log(`💻 Creating course "Introduction to Computing"...`);
    course = await prisma.course.create({
      data: { name: "Introduction to Computing", semesterId: semester.id },
    });
  }

  let session = await prisma.session.findFirst({
    where: { courseId: course.id, name: "2026/2027" },
  });
  if (!session) {
    console.log(`🗓️ Creating session "2026/2027"...`);
    session = await prisma.session.create({
      data: { name: "2026/2027", courseId: course.id },
    });
  }

  let classroomUnit = await prisma.classroomUnit.findFirst({
    where: { departmentId: department.id, sessionId: session.id },
  });
  if (!classroomUnit) {
    console.log(`🧩 Creating classroom unit for ${department.name} / ${session.name}...`);
    classroomUnit = await prisma.classroomUnit.create({
      data: { departmentId: department.id, sessionId: session.id },
    });
  }

  return { college, department, semester, course, session, classroomUnit };
}

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

  const hierarchy = await ensureSeedHierarchy(
    systemCollege.name === "System Administration College"
      ? "Faculty of Science"
      : systemCollege.name,
  );

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
        collegeId: ownerAdmin.collegeId || hierarchy.college.id,
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
        collegeId: hierarchy.college.id,
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
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Role:     ${ownerAdmin.role}`);
  console.log(`  Password: ${adminPassword}`);
  console.log(`  College:  ${hierarchy.college.name}`);
  console.log(`  Classroom Unit: ${hierarchy.classroomUnit.id}`);
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
