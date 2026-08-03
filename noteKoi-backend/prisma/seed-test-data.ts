/**
 * Test data seed — run once to populate colleges, departments, sessions,
 * courses, and demo users so you can test all features immediately.
 *
 * Usage (from noteKoi-backend/):
 *   npx tsx prisma/seed-test-data.ts
 */
import bcrypt from "bcrypt";
import { prisma } from "@prisma/prisma";

const STUDENT_PASSWORD = "Student@123";
const TEACHER_PASSWORD = "Teacher@123";

export default async function test_seed() {
  console.log("Creating test data...");

  // Get the admin user (must exist — run pnpm run seed first)
  const admin = await prisma.user.findFirst({ where: { role: "PLATFORM_ADMIN" } });
  if (!admin) throw new Error("Platform Admin not found. Run `pnpm run seed` first.");

  // ── Colleges ──────────────────────────────────────────────────────────────
  const college = await prisma.college.upsert({
    where: { name: "Demo University" },
    update: {},
    create: { name: "Demo University", isActive: true },
  });
  const college2 = await prisma.college.upsert({
    where: { name: "Sample College" },
    update: {},
    create: { name: "Sample College", isActive: true },
  });

  // ── Departments ───────────────────────────────────────────────────────────
  const csDept = await prisma.department.upsert({
    where: { name: "Computer Science" },
    update: {},
    create: { name: "Computer Science" },
  });
  const mathDept = await prisma.department.upsert({
    where: { name: "Mathematics" },
    update: {},
    create: { name: "Mathematics" },
  });
  await prisma.department.upsert({
    where: { name: "Physics" },
    update: {},
    create: { name: "Physics" },
  });

  // ── College ↔ Department links ────────────────────────────────────────────
  for (const deptId of [csDept.id, mathDept.id]) {
    await prisma.collegeDepartment.upsert({
      where: { collegeId_departmentId: { collegeId: college.id, departmentId: deptId } },
      update: {},
      create: { collegeId: college.id, departmentId: deptId },
    });
  }
  await prisma.collegeDepartment.upsert({
    where: { collegeId_departmentId: { collegeId: college2.id, departmentId: csDept.id } },
    update: {},
    create: { collegeId: college2.id, departmentId: csDept.id },
  });

  // ── Sessions ──────────────────────────────────────────────────────────────
  const csSession1 = await prisma.session.upsert({
    where: { departmentId_label: { departmentId: csDept.id, label: "2023-24" } },
    update: {},
    create: { departmentId: csDept.id, label: "2023-24", isOpen: true },
  });
  const csSession2 = await prisma.session.upsert({
    where: { departmentId_label: { departmentId: csDept.id, label: "2024-25" } },
    update: {},
    create: { departmentId: csDept.id, label: "2024-25", isOpen: true },
  });
  await prisma.session.upsert({
    where: { departmentId_label: { departmentId: mathDept.id, label: "2023-24" } },
    update: {},
    create: { departmentId: mathDept.id, label: "2023-24", isOpen: true },
  });

  // ── Courses ───────────────────────────────────────────────────────────────
  async function findOrCreateCourse(departmentId: string, name: string) {
    const existing = await prisma.course.findFirst({ where: { departmentId, name } });
    if (existing) return existing;
    return prisma.course.create({ data: { departmentId, name } });
  }
  const dsa = await findOrCreateCourse(csDept.id, "Data Structures & Algorithms");
  await findOrCreateCourse(csDept.id, "Database Management Systems");
  await findOrCreateCourse(csDept.id, "Operating Systems");
  await findOrCreateCourse(mathDept.id, "Calculus");
  console.log("Colleges, departments, sessions, courses created.");

  // ── Sub Admin for Demo University ─────────────────────────────────────────
  const subAdminHash = await bcrypt.hash("SubAdmin@123", 12);
  let subAdmin = await prisma.user.findUnique({ where: { email: "subadmin@demouniversity.com" } });
  if (!subAdmin) {
    subAdmin = await prisma.user.create({
      data: {
        email: "subadmin@demouniversity.com",
        name: "Demo Sub Admin",
        passwordHash: subAdminHash,
        role: "SUB_ADMIN",
        collegeId: college.id,
        isVerified: true,
      },
    });
  }
  const existingSubAdminAssignment = await prisma.subAdminAssignment.findFirst({
    where: { userId: subAdmin.id, isActive: true },
  });
  if (!existingSubAdminAssignment) {
    await prisma.subAdminAssignment.create({
      data: {
        userId: subAdmin.id,
        collegeId: college.id,
        appointedById: admin.id,
        isActive: true,
      },
    });
  }
  console.log("Sub Admin: subadmin@demouniversity.com / SubAdmin@123");

  // ── Teacher ───────────────────────────────────────────────────────────────
  const teacherHash = await bcrypt.hash(TEACHER_PASSWORD, 12);
  let teacher = await prisma.user.findUnique({ where: { email: "teacher@demouniversity.com" } });
  if (!teacher) {
    teacher = await prisma.user.create({
      data: {
        email: "teacher@demouniversity.com",
        name: "Demo Teacher",
        passwordHash: teacherHash,
        role: "TEACHER",
        collegeId: college.id,
        isVerified: true,
        teacherVerificationStatus: "VERIFIED",
      },
    });
  }
  await prisma.teacherDepartment.upsert({
    where: { teacherId_departmentId: { teacherId: teacher.id, departmentId: csDept.id } },
    update: {},
    create: { teacherId: teacher.id, departmentId: csDept.id },
  });
  console.log("Teacher: teacher@demouniversity.com / Teacher@123");

  // ── Student 1 (CR) ────────────────────────────────────────────────────────
  const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 12);
  let student1 = await prisma.user.findUnique({ where: { email: "student1@demouniversity.com" } });
  if (!student1) {
    student1 = await prisma.user.create({
      data: {
        email: "student1@demouniversity.com",
        name: "Alice Student",
        passwordHash: studentHash,
        role: "STUDENT",
        collegeId: college.id,
        departmentId: csDept.id,
        sessionId: csSession1.id,
        regNo: "CS2023001",
        isVerified: true,
      },
    });
  }
  const existingCrAssignment = await prisma.crCoCrAssignment.findFirst({
    where: { userId: student1.id, isActive: true },
  });
  if (!existingCrAssignment) {
    await prisma.crCoCrAssignment.create({
      data: {
        userId: student1.id,
        collegeId: college.id,
        departmentId: csDept.id,
        sessionId: csSession1.id,
        type: "CR",
        appointedById: subAdmin.id,
        isActive: true,
      },
    });
  }
  console.log("Student 1 (CR for CS 2023-24): student1@demouniversity.com / Student@123");

  // ── Student 2 (unverified) ────────────────────────────────────────────────
  let student2 = await prisma.user.findUnique({ where: { email: "student2@demouniversity.com" } });
  if (!student2) {
    student2 = await prisma.user.create({
      data: {
        email: "student2@demouniversity.com",
        name: "Bob Student",
        passwordHash: studentHash,
        role: "STUDENT",
        collegeId: college.id,
        departmentId: csDept.id,
        sessionId: csSession2.id,
        regNo: "CS2024001",
        isVerified: false,
      },
    });
  }
  console.log("Student 2 (unverified, pending CR verification): student2@demouniversity.com / Student@123");

  console.log("\n✅ Test data ready!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("ACCOUNTS (all at http://localhost:3000/login)");
  console.log("Platform Admin:  sheikhrobin116981@gmail.com  / Password@123");
  console.log("Sub Admin:       subadmin@demouniversity.com  / SubAdmin@123");
  console.log("Teacher:         teacher@demouniversity.com   / Teacher@123");
  console.log("Student CR:      student1@demouniversity.com  / Student@123");
  console.log("Student:         student2@demouniversity.com  / Student@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("College: Demo University");
  console.log("Depts:   Computer Science | Mathematics");
  console.log("Sessions: CS-2023-24 (Alice/CR), CS-2024-25 (Bob)");
  console.log("Courses: DSA | DBMS | OS (CS), Calculus (Math)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}
