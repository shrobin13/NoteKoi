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

// ── Static reference data ───────────────────────────────────────────────────

const DEPARTMENTS = [
  { code: "CSE", name: "Computer Science & Engineering" },
  { code: "EEE", name: "Electrical & Electronic Engineering" },
  { code: "CE",  name: "Civil Engineering" },
] as const;

const COLLEGES = [
  { name: "Faridpur Engineering College",    shortName: "FEC", departments: ["CSE", "EEE", "CE"] },
  { name: "Mymensingh Engineering College",  shortName: "MEC", departments: ["CSE", "EEE", "CE"] },
  { name: "Barishal Engineering College",    shortName: "BEC", departments: ["CSE", "EEE", "CE"] },
] as const;

const SESSION_LABELS = [
  "2018-19", "2019-20", "2020-21", "2021-22",
  "2022-23", "2023-24", "2024-25", "2025-26", "2026-27",
] as const;

const COURSES_BY_DEPT: Record<string, string[]> = {
  CSE: [
    "Data Structures & Algorithms",
    "Database Management Systems",
    "Operating Systems",
    "Computer Networks",
    "Software Engineering",
    "Theory of Computation",
    "Compiler Design",
    "Artificial Intelligence",
  ],
  EEE: [
    "Circuit Theory",
    "Electrical Machines",
    "Power Systems",
    "Power Electronics",
    "Digital Electronics",
    "Control Systems",
    "Signals & Systems",
    "Microprocessors & Microcontrollers",
  ],
  CE: [
    "Structural Analysis",
    "Geotechnical Engineering",
    "Fluid Mechanics",
    "Surveying",
    "Transportation Engineering",
    "Environmental Engineering",
    "Reinforced Concrete Design",
    "Construction Management",
  ],
};

export default async function test_seed() {
  console.log("Creating test data...\n");

  // ── 0. Platform Admin must exist ──────────────────────────────────────────
  const admin = await prisma.user.findFirst({ where: { role: "PLATFORM_ADMIN" } });
  if (!admin) throw new Error("Platform Admin not found. Run `pnpm run seed` first.");
  console.log(`✔ Platform Admin found: ${admin.email}`);

  // ── 1. Departments (global) ───────────────────────────────────────────────
  const deptMap = new Map<string, { id: string; code: string; name: string }>();

  for (const dept of DEPARTMENTS) {
    const created = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: { name: dept.name },
    });
    deptMap.set(dept.code, { id: created.id, code: dept.code, name: created.name });
  }
  console.log(`✔ Departments: ${[...deptMap.values()].map(d => d.code).join(", ")}`);

  // ── 2. Colleges ───────────────────────────────────────────────────────────
  const collegeMap = new Map<string, { id: string; name: string; shortName: string }>();

  for (const college of COLLEGES) {
    const created = await prisma.college.upsert({
      where: { name: college.name },
      update: {},
      create: { name: college.name, isActive: true },
    });
    collegeMap.set(college.shortName, { id: created.id, name: created.name, shortName: college.shortName });
  }
  console.log(`✔ Colleges: ${[...collegeMap.values()].map(c => c.shortName).join(", ")}`);

  // ── 3. College ↔ Department links ─────────────────────────────────────────
  let cdCount = 0;
  for (const college of COLLEGES) {
    const collegeRow = collegeMap.get(college.shortName)!;
    for (const deptCode of college.departments) {
      const deptRow = deptMap.get(deptCode)!;
      await prisma.collegeDepartment.upsert({
        where: { collegeId_departmentId: { collegeId: collegeRow.id, departmentId: deptRow.id } },
        update: {},
        create: { collegeId: collegeRow.id, departmentId: deptRow.id },
      });
      cdCount++;
    }
  }
  console.log(`✔ College-Department links: ${cdCount}`);

  // ── 4. Sessions (per department, not per college — sessions are platform-level) ──
  let sessionCount = 0;
  for (const dept of deptMap.values()) {
    for (const label of SESSION_LABELS) {
      await prisma.session.upsert({
        where: { departmentId_label: { departmentId: dept.id, label } },
        update: {},
        create: { departmentId: dept.id, label, isOpen: true },
      });
      sessionCount++;
    }
  }
  console.log(`✔ Sessions: ${sessionCount} (${SESSION_LABELS.length} per department × ${DEPARTMENTS.length} departments)`);

  // ── 5. Courses (per department) ───────────────────────────────────────────
  let courseCount = 0;
  for (const [deptCode, deptRow] of deptMap) {
    const courseNames = COURSES_BY_DEPT[deptCode] ?? [];
    for (const name of courseNames) {
      const existing = await prisma.course.findFirst({ where: { departmentId: deptRow.id, name } });
      if (!existing) {
        await prisma.course.create({ data: { departmentId: deptRow.id, name } });
        courseCount++;
      }
    }
  }
  console.log(`✔ Courses: ${courseCount} created (${Object.values(COURSES_BY_DEPT).flat().length} total across departments)`);

  // ── 6. Demo users ─────────────────────────────────────────────────────────
  const fec = collegeMap.get("FEC")!;
  const cse = deptMap.get("CSE")!;
  const session2324 = await prisma.session.findUnique({
    where: { departmentId_label: { departmentId: cse.id, label: "2023-24" } },
  });
  const session2425 = await prisma.session.findUnique({
    where: { departmentId_label: { departmentId: cse.id, label: "2024-25" } },
  });
  if (!session2324 || !session2425) throw new Error("CSE sessions 2023-24 / 2024-25 not found.");

  // ── 6a. Sub Admin for FEC ─────────────────────────────────────────────────
  const subAdminHash = await bcrypt.hash("SubAdmin@123", 12);
  let subAdmin = await prisma.user.findUnique({ where: { email: "subadmin@fec.ac.bd" } });
  if (!subAdmin) {
    subAdmin = await prisma.user.create({
      data: {
        email: "subadmin@fec.ac.bd",
        name: "FEC Sub Admin",
        passwordHash: subAdminHash,
        role: "SUB_ADMIN",
        collegeId: fec.id,
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
        collegeId: fec.id,
        appointedById: admin.id,
        isActive: true,
      },
    });
  }

  // ── 6b. Teacher for FEC (assigned to CSE & EEE) ───────────────────────────
  const teacherHash = await bcrypt.hash(TEACHER_PASSWORD, 12);
  let teacher = await prisma.user.findUnique({ where: { email: "teacher@fec.ac.bd" } });
  if (!teacher) {
    teacher = await prisma.user.create({
      data: {
        email: "teacher@fec.ac.bd",
        name: "Dr. Aminul Islam",
        passwordHash: teacherHash,
        role: "TEACHER",
        collegeId: fec.id,
        isVerified: true,
        teacherVerificationStatus: "VERIFIED",
      },
    });
  }
  const eee = deptMap.get("EEE")!;
  for (const dept of [cse, eee]) {
    await prisma.teacherDepartment.upsert({
      where: { teacherId_departmentId: { teacherId: teacher.id, departmentId: dept.id } },
      update: {},
      create: { teacherId: teacher.id, departmentId: dept.id },
    });
  }

  // ── 6c. Student 1 — CR for FEC CSE 2023-24 ───────────────────────────────
  const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 12);
  let student1 = await prisma.user.findUnique({ where: { email: "student1@fec.ac.bd" } });
  if (!student1) {
    student1 = await prisma.user.create({
      data: {
        email: "student1@fec.ac.bd",
        name: "Rahim Uddin",
        passwordHash: studentHash,
        role: "STUDENT",
        collegeId: fec.id,
        departmentId: cse.id,
        sessionId: session2324.id,
        regNo: "FEC-CSE-2023-001",
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
        collegeId: fec.id,
        departmentId: cse.id,
        sessionId: session2324.id,
        type: "CR",
        appointedById: subAdmin.id,
        isActive: true,
      },
    });
  }

  // ── 6d. Student 2 — unverified, FEC CSE 2024-25 ──────────────────────────
  let student2 = await prisma.user.findUnique({ where: { email: "student2@fec.ac.bd" } });
  if (!student2) {
    student2 = await prisma.user.create({
      data: {
        email: "student2@fec.ac.bd",
        name: "Karim Hossain",
        passwordHash: studentHash,
        role: "STUDENT",
        collegeId: fec.id,
        departmentId: cse.id,
        sessionId: session2425.id,
        regNo: "FEC-CSE-2024-001",
        isVerified: false,
      },
    });
  }

  // ── 6e. Student 3 — verified regular student, FEC EEE 2022-23 ─────────────
  const session2223 = await prisma.session.findUnique({
    where: { departmentId_label: { departmentId: eee.id, label: "2022-23" } },
  });
  if (!session2223) throw new Error("EEE session 2022-23 not found.");

  let student3 = await prisma.user.findUnique({ where: { email: "student3@fec.ac.bd" } });
  if (!student3) {
    student3 = await prisma.user.create({
      data: {
        email: "student3@fec.ac.bd",
        name: "Jamal Ahmed",
        passwordHash: studentHash,
        role: "STUDENT",
        collegeId: fec.id,
        departmentId: eee.id,
        sessionId: session2223.id,
        regNo: "FEC-EEE-2022-001",
        isVerified: true,
      },
    });
  }

  // ── 6f. Sub Admin for MEC ─────────────────────────────────────────────────
  const mec = collegeMap.get("MEC")!;
  const mecSubAdminHash = await bcrypt.hash("SubAdmin@123", 12);
  let mecSubAdmin = await prisma.user.findUnique({ where: { email: "subadmin@mec.ac.bd" } });
  if (!mecSubAdmin) {
    mecSubAdmin = await prisma.user.create({
      data: {
        email: "subadmin@mec.ac.bd",
        name: "MEC Sub Admin",
        passwordHash: mecSubAdminHash,
        role: "SUB_ADMIN",
        collegeId: mec.id,
        isVerified: true,
      },
    });
  }
  const existingMecSubAdminAssignment = await prisma.subAdminAssignment.findFirst({
    where: { userId: mecSubAdmin.id, isActive: true },
  });
  if (!existingMecSubAdminAssignment) {
    await prisma.subAdminAssignment.create({
      data: {
        userId: mecSubAdmin.id,
        collegeId: mec.id,
        appointedById: admin.id,
        isActive: true,
      },
    });
  }

  // ── 6g. Teacher for MEC (CSE only) ────────────────────────────────────────
  let mecTeacher = await prisma.user.findUnique({ where: { email: "teacher@mec.ac.bd" } });
  if (!mecTeacher) {
    mecTeacher = await prisma.user.create({
      data: {
        email: "teacher@mec.ac.bd",
        name: "Dr. Nasreen Akter",
        passwordHash: teacherHash,
        role: "TEACHER",
        collegeId: mec.id,
        isVerified: true,
        teacherVerificationStatus: "VERIFIED",
      },
    });
  }
  await prisma.teacherDepartment.upsert({
    where: { teacherId_departmentId: { teacherId: mecTeacher.id, departmentId: cse.id } },
    update: {},
    create: { teacherId: mecTeacher.id, departmentId: cse.id },
  });

  // ── 6h. Student at MEC — CR for CSE 2024-25 ──────────────────────────────
  const mecSession2425 = await prisma.session.findUnique({
    where: { departmentId_label: { departmentId: cse.id, label: "2024-25" } },
  });
  if (!mecSession2425) throw new Error("CSE session 2024-25 not found (MEC).");

  let mecStudent = await prisma.user.findUnique({ where: { email: "student@mec.ac.bd" } });
  if (!mecStudent) {
    mecStudent = await prisma.user.create({
      data: {
        email: "student@mec.ac.bd",
        name: "Tanvir Hasan",
        passwordHash: studentHash,
        role: "STUDENT",
        collegeId: mec.id,
        departmentId: cse.id,
        sessionId: mecSession2425.id,
        regNo: "MEC-CSE-2024-001",
        isVerified: true,
      },
    });
  }
  const existingMecCrAssignment = await prisma.crCoCrAssignment.findFirst({
    where: { userId: mecStudent.id, isActive: true },
  });
  if (!existingMecCrAssignment) {
    await prisma.crCoCrAssignment.create({
      data: {
        userId: mecStudent.id,
        collegeId: mec.id,
        departmentId: cse.id,
        sessionId: mecSession2425.id,
        type: "CR",
        appointedById: mecSubAdmin.id,
        isActive: true,
      },
    });
  }

  console.log("\n✅ Test data ready!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("ACCOUNTS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Platform Admin:  sheikhrobin116981@gmail.com  / Password@123");
  console.log("");
  console.log("── Faridpur Engineering College (FEC) ──────────────────────────");
  console.log("  Sub Admin:    subadmin@fec.ac.bd   / SubAdmin@123");
  console.log("  Teacher:      teacher@fec.ac.bd    / Teacher@123   (CSE + EEE)");
  console.log("  Student CR:   student1@fec.ac.bd   / Student@123   (CSE 2023-24, CR)");
  console.log("  Student:      student2@fec.ac.bd   / Student@123   (CSE 2024-25, unverified)");
  console.log("  Student:      student3@fec.ac.bd   / Student@123   (EEE 2022-23, verified)");
  console.log("");
  console.log("── Mymensingh Engineering College (MEC) ────────────────────────");
  console.log("  Sub Admin:    subadmin@mec.ac.bd   / SubAdmin@123");
  console.log("  Teacher:      teacher@mec.ac.bd    / Teacher@123   (CSE)");
  console.log("  Student CR:   student@mec.ac.bd    / Student@123   (CSE 2024-25, CR)");
  console.log("");
  console.log("── Barishal Engineering College (BEC) ──────────────────────────");
  console.log("  (no users yet — add via platform admin or another seed run)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("ORGANISATION HIERARCHY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  for (const college of COLLEGES) {
    const c = collegeMap.get(college.shortName)!;
    console.log(`\n${college.name} (${college.shortName})`);
    for (const deptCode of college.departments) {
      const d = deptMap.get(deptCode)!;
      const courses = COURSES_BY_DEPT[deptCode] ?? [];
      console.log(`  └── ${d.name} (${deptCode})`);
      console.log(`      ├── Sessions: ${SESSION_LABELS[0]} → ${SESSION_LABELS[SESSION_LABELS.length - 1]} (${SESSION_LABELS.length})`);
      console.log(`      └── Courses: ${courses.slice(0, 3).join(", ")}${courses.length > 3 ? ` ... +${courses.length - 3} more` : ""}`);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("TOTALS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Departments:          ${DEPARTMENTS.length}`);
  console.log(`  Colleges:             ${COLLEGES.length}`);
  console.log(`  College-Dept links:   ${cdCount}`);
  console.log(`  Sessions:             ${sessionCount}`);
  console.log(`  Courses:              ${Object.values(COURSES_BY_DEPT).flat().length}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}