import prisma from "../../lib/prisma.js";
import { ApiError, paginate } from "../../types/index.js";
// ─── Colleges ────────────────────────────────────────────────────────────────
export async function listColleges(pagination) {
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
export async function getCollege(id) {
    const college = await prisma.college.findUnique({
        where: { id },
        include: { departments: true, _count: { select: { users: true } } },
    });
    if (!college)
        throw ApiError.notFound("College not found");
    return college;
}
export async function createCollege(dto) {
    return prisma.college.create({ data: dto });
}
export async function updateCollege(id, dto) {
    const college = await prisma.college.findUnique({ where: { id } });
    if (!college)
        throw ApiError.notFound("College not found");
    return prisma.college.update({ where: { id }, data: dto });
}
export async function deleteCollege(id) {
    const college = await prisma.college.findUnique({ where: { id } });
    if (!college)
        throw ApiError.notFound("College not found");
    return prisma.college.delete({ where: { id } });
}
// ─── Departments ─────────────────────────────────────────────────────────────
export async function listDepartments(collegeId, pagination) {
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
export async function getDepartment(id) {
    const dept = await prisma.department.findUnique({
        where: { id },
        include: { college: true, semesters: true },
    });
    if (!dept)
        throw ApiError.notFound("Department not found");
    return dept;
}
export async function createDepartment(dto) {
    const college = await prisma.college.findUnique({ where: { id: dto.collegeId } });
    if (!college)
        throw ApiError.badRequest("College not found");
    return prisma.department.create({ data: dto });
}
export async function updateDepartment(id, dto) {
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept)
        throw ApiError.notFound("Department not found");
    return prisma.department.update({ where: { id }, data: dto });
}
export async function deleteDepartment(id) {
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept)
        throw ApiError.notFound("Department not found");
    return prisma.department.delete({ where: { id } });
}
// ─── Semesters ───────────────────────────────────────────────────────────────
export async function listSemesters(departmentId, pagination) {
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
export async function getSemester(id) {
    const semester = await prisma.semester.findUnique({
        where: { id },
        include: { department: true, courses: true },
    });
    if (!semester)
        throw ApiError.notFound("Semester not found");
    return semester;
}
export async function createSemester(dto) {
    const dept = await prisma.department.findUnique({ where: { id: dto.departmentId } });
    if (!dept)
        throw ApiError.badRequest("Department not found");
    return prisma.semester.create({ data: dto });
}
export async function updateSemester(id, dto) {
    const semester = await prisma.semester.findUnique({ where: { id } });
    if (!semester)
        throw ApiError.notFound("Semester not found");
    return prisma.semester.update({ where: { id }, data: dto });
}
export async function deleteSemester(id) {
    const semester = await prisma.semester.findUnique({ where: { id } });
    if (!semester)
        throw ApiError.notFound("Semester not found");
    return prisma.semester.delete({ where: { id } });
}
// ─── Courses ─────────────────────────────────────────────────────────────────
export async function listCourses(semesterId, pagination) {
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
export async function getCourse(id) {
    const course = await prisma.course.findUnique({
        where: { id },
        include: { semester: { include: { department: true } }, sessions: true },
    });
    if (!course)
        throw ApiError.notFound("Course not found");
    return course;
}
export async function createCourse(dto) {
    const semester = await prisma.semester.findUnique({ where: { id: dto.semesterId } });
    if (!semester)
        throw ApiError.badRequest("Semester not found");
    return prisma.course.create({ data: dto });
}
export async function updateCourse(id, dto) {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course)
        throw ApiError.notFound("Course not found");
    return prisma.course.update({ where: { id }, data: dto });
}
export async function deleteCourse(id) {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course)
        throw ApiError.notFound("Course not found");
    return prisma.course.delete({ where: { id } });
}
// ─── Sessions ────────────────────────────────────────────────────────────────
export async function listSessions(courseId, pagination) {
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
export async function getSession(id) {
    const session = await prisma.session.findUnique({
        where: { id },
        include: { course: true },
    });
    if (!session)
        throw ApiError.notFound("Session not found");
    return session;
}
export async function createSession(dto) {
    const course = await prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course)
        throw ApiError.badRequest("Course not found");
    return prisma.session.create({ data: dto });
}
export async function updateSession(id, dto) {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session)
        throw ApiError.notFound("Session not found");
    return prisma.session.update({ where: { id }, data: dto });
}
export async function deleteSession(id) {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session)
        throw ApiError.notFound("Session not found");
    return prisma.session.delete({ where: { id } });
}
// ─── ClassroomUnits ───────────────────────────────────────────────────────────
export async function listClassroomUnits(filter, pagination) {
    const { skip, take } = paginate(pagination.page, pagination.limit);
    const where = {
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
export async function getClassroomUnit(id) {
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
    if (!unit)
        throw ApiError.notFound("ClassroomUnit not found");
    return unit;
}
// R-031, INV-006: one ClassroomUnit per (departmentId, sessionId) pair
export async function createClassroomUnit(dto) {
    const dept = await prisma.department.findUnique({ where: { id: dto.departmentId } });
    if (!dept)
        throw ApiError.badRequest("Department not found");
    const session = await prisma.session.findUnique({ where: { id: dto.sessionId } });
    if (!session)
        throw ApiError.badRequest("Session not found");
    // The @@unique([departmentId, sessionId]) in schema + a P2002 from Prisma handles the uniqueness.
    // We still do an app-level pre-check to return a clean 409 (not a raw Prisma error).
    const existing = await prisma.classroomUnit.findUnique({
        where: { departmentId_sessionId: { departmentId: dto.departmentId, sessionId: dto.sessionId } },
    });
    if (existing) {
        throw ApiError.conflict("A ClassroomUnit for this department+session pair already exists", "CLASSROOM_UNIT_DUPLICATE");
    }
    return prisma.classroomUnit.create({ data: dto });
}
export async function deleteClassroomUnit(id) {
    const unit = await prisma.classroomUnit.findUnique({ where: { id } });
    if (!unit)
        throw ApiError.notFound("ClassroomUnit not found");
    return prisma.classroomUnit.delete({ where: { id } });
}
