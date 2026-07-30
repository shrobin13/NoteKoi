import prisma from "../../lib/prisma.js";
import { ApiError, paginate } from "../../types/index.js";
import type {
  CreateCollegeDto,
  UpdateCollegeDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateSemesterDto,
  UpdateSemesterDto,
  CreateCourseDto,
  UpdateCourseDto,
  CreateSessionDto,
  UpdateSessionDto,
  CreateClassroomUnitDto,
  BootstrapCollegeDto,
  AddClassroomUnitDto,
  PaginationDto,
} from "./hierarchy.schema.js";

// ─── Colleges ────────────────────────────────────────────────────────────────

export async function listColleges(pagination: PaginationDto) {
  const { skip, take } = paginate(pagination.page, pagination.limit);
  const [data, total] = await prisma.$transaction([
    prisma.college.findMany({
      skip,
      take,
      orderBy: { name: "asc" },
      include: { _count: { select: { departments: true, users: true } } },
    }),
    prisma.college.count(),
  ]);
  return { data, meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) } };
}

export async function getCollege(id: string) {
  const college = await prisma.college.findUnique({
    where: { id },
    include: { departments: true, _count: { select: { users: true } } },
  });
  if (!college) throw ApiError.notFound("College not found");
  return college;
}

export async function createCollege(dto: CreateCollegeDto) {
  return prisma.college.create({ data: dto });
}

export async function updateCollege(id: string, dto: UpdateCollegeDto) {
  const college = await prisma.college.findUnique({ where: { id } });
  if (!college) throw ApiError.notFound("College not found");
  return prisma.college.update({ where: { id }, data: dto });
}

export async function deleteCollege(id: string) {
  const college = await prisma.college.findUnique({ where: { id } });
  if (!college) throw ApiError.notFound("College not found");
  return prisma.college.delete({ where: { id } });
}

// ─── Departments ─────────────────────────────────────────────────────────────

export async function listDepartments(collegeId: string, pagination: PaginationDto) {
  const { skip, take } = paginate(pagination.page, pagination.limit);
  const [data, total] = await prisma.$transaction([
    prisma.department.findMany({
      where: { collegeId },
      skip,
      take,
      orderBy: { name: "asc" },
      include: { _count: { select: { semesters: true } } },
    }),
    prisma.department.count({ where: { collegeId } }),
  ]);
  return { data, meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) } };
}

export async function getDepartment(id: string) {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: { college: true, semesters: true },
  });
  if (!dept) throw ApiError.notFound("Department not found");
  return dept;
}

export async function createDepartment(dto: CreateDepartmentDto) {
  const college = await prisma.college.findUnique({ where: { id: dto.collegeId } });
  if (!college) throw ApiError.badRequest("College not found");
  return prisma.department.create({ data: dto });
}

export async function updateDepartment(id: string, dto: UpdateDepartmentDto) {
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw ApiError.notFound("Department not found");
  return prisma.department.update({ where: { id }, data: dto });
}

export async function deleteDepartment(id: string) {
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw ApiError.notFound("Department not found");
  return prisma.department.delete({ where: { id } });
}

// ─── Semesters ───────────────────────────────────────────────────────────────

export async function listSemesters(departmentId: string, pagination: PaginationDto) {
  const { skip, take } = paginate(pagination.page, pagination.limit);
  const [data, total] = await prisma.$transaction([
    prisma.semester.findMany({
      where: { departmentId },
      skip,
      take,
      orderBy: { name: "asc" },
      include: { _count: { select: { courses: true } } },
    }),
    prisma.semester.count({ where: { departmentId } }),
  ]);
  return { data, meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) } };
}

export async function getSemester(id: string) {
  const semester = await prisma.semester.findUnique({
    where: { id },
    include: { department: true, courses: true },
  });
  if (!semester) throw ApiError.notFound("Semester not found");
  return semester;
}

export async function createSemester(dto: CreateSemesterDto) {
  const dept = await prisma.department.findUnique({ where: { id: dto.departmentId } });
  if (!dept) throw ApiError.badRequest("Department not found");
  return prisma.semester.create({ data: dto });
}

export async function updateSemester(id: string, dto: UpdateSemesterDto) {
  const semester = await prisma.semester.findUnique({ where: { id } });
  if (!semester) throw ApiError.notFound("Semester not found");
  return prisma.semester.update({ where: { id }, data: dto });
}

export async function deleteSemester(id: string) {
  const semester = await prisma.semester.findUnique({ where: { id } });
  if (!semester) throw ApiError.notFound("Semester not found");
  return prisma.semester.delete({ where: { id } });
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export async function listCourses(semesterId: string, pagination: PaginationDto) {
  const { skip, take } = paginate(pagination.page, pagination.limit);
  const [data, total] = await prisma.$transaction([
    prisma.course.findMany({
      where: { semesterId },
      skip,
      take,
      orderBy: { name: "asc" },
      include: { _count: { select: { sessions: true } } },
    }),
    prisma.course.count({ where: { semesterId } }),
  ]);
  return { data, meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) } };
}

export async function getCourse(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: { semester: { include: { department: true } }, sessions: true },
  });
  if (!course) throw ApiError.notFound("Course not found");
  return course;
}

export async function createCourse(dto: CreateCourseDto) {
  const semester = await prisma.semester.findUnique({ where: { id: dto.semesterId } });
  if (!semester) throw ApiError.badRequest("Semester not found");
  return prisma.course.create({ data: dto });
}

export async function updateCourse(id: string, dto: UpdateCourseDto) {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw ApiError.notFound("Course not found");
  return prisma.course.update({ where: { id }, data: dto });
}

export async function deleteCourse(id: string) {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw ApiError.notFound("Course not found");
  return prisma.course.delete({ where: { id } });
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function listSessions(courseId: string, pagination: PaginationDto) {
  const { skip, take } = paginate(pagination.page, pagination.limit);
  const [data, total] = await prisma.$transaction([
    prisma.session.findMany({
      where: { courseId },
      skip,
      take,
      orderBy: { name: "asc" },
    }),
    prisma.session.count({ where: { courseId } }),
  ]);
  return { data, meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) } };
}

export async function getSession(id: string) {
  const session = await prisma.session.findUnique({
    where: { id },
    include: { course: true },
  });
  if (!session) throw ApiError.notFound("Session not found");
  return session;
}

export async function createSession(dto: CreateSessionDto) {
  const course = await prisma.course.findUnique({ where: { id: dto.courseId } });
  if (!course) throw ApiError.badRequest("Course not found");
  return prisma.session.create({ data: dto });
}

export async function updateSession(id: string, dto: UpdateSessionDto) {
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) throw ApiError.notFound("Session not found");
  return prisma.session.update({ where: { id }, data: dto });
}

export async function deleteSession(id: string) {
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) throw ApiError.notFound("Session not found");
  return prisma.session.delete({ where: { id } });
}

// ─── ClassroomUnits ───────────────────────────────────────────────────────────

export async function listClassroomUnits(
  filter: { departmentId?: string; sessionId?: string; collegeId?: string },
  pagination: PaginationDto,
) {
  const { skip, take } = paginate(pagination.page, pagination.limit);
  const where = {
    ...(filter.collegeId ? { department: { collegeId: filter.collegeId } } : {}),
    ...(filter.departmentId ? { departmentId: filter.departmentId } : {}),
    ...(filter.sessionId ? { sessionId: filter.sessionId } : {}),
  };
  const [data, total] = await prisma.$transaction([
    prisma.classroomUnit.findMany({
      where,
      skip,
      take,
      include: {
        department: { select: { id: true, name: true } },
        session: {
          select: {
            id: true,
            name: true,
            course: {
              select: { id: true, name: true, semester: { select: { id: true, name: true } } },
            },
          },
        },
        _count: { select: { crAssignments: true, users: true } },
      },
    }),
    prisma.classroomUnit.count({ where }),
  ]);
  return { data, meta: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.ceil(total / pagination.limit) } };
}

export async function getClassroomUnit(id: string) {
  const unit = await prisma.classroomUnit.findUnique({
    where: { id },
    include: {
      department: { include: { college: true } },
      session: { include: { course: { include: { semester: true } } } },
      crAssignments: {
        where: { isActive: true },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!unit) throw ApiError.notFound("ClassroomUnit not found");
  return unit;
}

// R-031, INV-006: one ClassroomUnit per (departmentId, sessionId) pair
export async function createClassroomUnit(dto: CreateClassroomUnitDto) {
  const dept = await prisma.department.findUnique({ where: { id: dto.departmentId } });
  if (!dept) throw ApiError.badRequest("Department not found");

  const session = await prisma.session.findUnique({ where: { id: dto.sessionId } });
  if (!session) throw ApiError.badRequest("Session not found");

  // The @@unique([departmentId, sessionId]) in schema + a P2002 from Prisma handles the uniqueness.
  // We still do an app-level pre-check to return a clean 409 (not a raw Prisma error).
  const existing = await prisma.classroomUnit.findUnique({
    where: { departmentId_sessionId: { departmentId: dto.departmentId, sessionId: dto.sessionId } },
  });
  if (existing) {
    throw ApiError.conflict(
      "A ClassroomUnit for this department+session pair already exists",
      "CLASSROOM_UNIT_DUPLICATE",
    );
  }

  return prisma.classroomUnit.create({ data: dto });
}

export async function deleteClassroomUnit(id: string) {
  const unit = await prisma.classroomUnit.findUnique({ where: { id } });
  if (!unit) throw ApiError.notFound("ClassroomUnit not found");
  return prisma.classroomUnit.delete({ where: { id } });
}

// ─── Bootstrap: full one-shot hierarchy creation ─────────────────────────────────

/**
 * Creates the full College → Department → Semester → Course(“General”) →
 * Session → ClassroomUnit chain in a single atomic transaction.
 *
 * College is upserted by name so re-running with the same college name
 * safely reuses the existing college. Department is created fresh inside
 * that college (fails with 409 if the (collegeId, departmentName) pair
 * already exists). The rest of the chain is always new.
 */
export async function bootstrapCollege(dto: BootstrapCollegeDto) {
  return prisma.$transaction(async (tx) => {
    // 1. Upsert college by name
    const college = await tx.college.upsert({
      where: { name: dto.collegeName },
      create: { name: dto.collegeName },
      update: {},
    });

    // 2. Create department (fail cleanly on duplicate dept name in same college)
    const existingDept = await tx.department.findUnique({
      where: { collegeId_name: { collegeId: college.id, name: dto.departmentName } },
    });
    if (existingDept) {
      throw ApiError.conflict(
        `Department "${dto.departmentName}" already exists in college "${dto.collegeName}". Use "Add Session" instead.`,
        "DEPARTMENT_DUPLICATE",
      );
    }
    const department = await tx.department.create({
      data: { name: dto.departmentName, collegeId: college.id },
    });

    // 3. Create semester named after sessionLabel
    const semester = await tx.semester.create({
      data: { name: dto.sessionLabel, departmentId: department.id },
    });

    // 4. Create a "General" course under that semester
    const course = await tx.course.create({
      data: { name: "General", semesterId: semester.id },
    });

    // 5. Create session named after sessionLabel under that course
    const session = await tx.session.create({
      data: { name: dto.sessionLabel, courseId: course.id },
    });

    // 6. Create the ClassroomUnit (departmentId, sessionId) pair
    const classroomUnit = await tx.classroomUnit.create({
      data: { departmentId: department.id, sessionId: session.id },
      include: {
        department: { select: { id: true, name: true } },
        session: { select: { id: true, name: true } },
      },
    });

    return { college, department, classroomUnit };
  });
}

/**
 * Adds a new session (and its ClassroomUnit) to an already-existing department.
 * Creates: Semester → Course(“General”) → Session → ClassroomUnit.
 * Fails with 409 if the department already has a ClassroomUnit for this
 * sessionLabel (enforced via the @@unique([departmentId, sessionId]) constraint).
 */
export async function addClassroomUnitToExistingDept(
  departmentId: string,
  dto: AddClassroomUnitDto,
) {
  return prisma.$transaction(async (tx) => {
    const dept = await tx.department.findUnique({ where: { id: departmentId } });
    if (!dept) throw ApiError.notFound("Department not found");

    // Refuse if a semester with the same sessionLabel already exists to prevent
    // silent duplicates. Admin should use a distinct label per session.
    const existingSemester = await tx.semester.findUnique({
      where: { departmentId_name: { departmentId, name: dto.sessionLabel } },
    });
    if (existingSemester) {
      throw ApiError.conflict(
        `A session "${dto.sessionLabel}" already exists for this department.`,
        "SESSION_DUPLICATE",
      );
    }

    const semester = await tx.semester.create({
      data: { name: dto.sessionLabel, departmentId },
    });

    const course = await tx.course.create({
      data: { name: "General", semesterId: semester.id },
    });

    const session = await tx.session.create({
      data: { name: dto.sessionLabel, courseId: course.id },
    });

    const classroomUnit = await tx.classroomUnit.create({
      data: { departmentId, sessionId: session.id },
      include: {
        department: { select: { id: true, name: true } },
        session: { select: { id: true, name: true } },
      },
    });

    return { classroomUnit };
  });
}
