import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../prisma/prisma.js";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export function createUser(data: Prisma.UserCreateInput) {
  return prisma.user.create({
    data,
  });
}

export function createTeacherUserWithDepartments(data: Prisma.UserCreateInput, departmentIds: string[]) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data,
    });

    await Promise.all(
      departmentIds.map((departmentId) =>
        tx.teacherDepartment.create({
          data: {
            teacherId: user.id,
            departmentId,
          },
        }),
      ),
    );

    return user;
  });
}

export function updateUserPassword(userId: string, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export function updateUserProfileData(userId: string, data: { name?: string | null }) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export function findUserByCollegeAndRegNo(collegeId: string, regNo: string) {
  return prisma.user.findFirst({
    where: {
      collegeId,
      regNo,
    },
  });
}

export function updateUserVerification(userId: string, isVerified: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isVerified },
  });
}

export function updateUserRole(userId: string, role: Prisma.UserCreateInput["role"]) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

export function findUsersByDepartmentAndSession(departmentId: string, sessionId: string) {
  return prisma.user.findMany({
    where: {
      departmentId,
      sessionId,
      isVerified: false,
    },
    orderBy: { createdAt: "desc" },
  });
}

export function findPendingStudentsByCollege(collegeId: string, departmentId?: string, sessionId?: string) {
  return prisma.user.findMany({
    where: {
      role: "STUDENT",
      collegeId,
      isVerified: false,
      ...(departmentId ? { departmentId } : {}),
      ...(sessionId ? { sessionId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export function findPendingTeachersByCollege(collegeId: string) {
  return prisma.user.findMany({
    where: {
      role: "TEACHER",
      collegeId,
      teacherVerificationStatus: "PENDING_VERIFICATION",
    },
    orderBy: { createdAt: "desc" },
  });
}

export function updateTeacherVerificationStatus(userId: string, status: "VERIFIED" | "PENDING_VERIFICATION") {
  return prisma.user.update({
    where: { id: userId },
    data: { teacherVerificationStatus: status },
  });
}

export function findTeacherDepartmentIds(teacherId: string) {
  return prisma.teacherDepartment.findMany({
    where: { teacherId },
    select: { departmentId: true },
  });
}
