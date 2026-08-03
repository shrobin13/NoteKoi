import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../prisma/prisma.js";

export function findActiveSubAdminAssignmentByCollege(collegeId: string) {
  return prisma.subAdminAssignment.findFirst({
    where: {
      collegeId,
      isActive: true,
    },
  });
}

export function findActiveSubAdminAssignmentByUser(userId: string) {
  return prisma.subAdminAssignment.findFirst({
    where: {
      userId,
      isActive: true,
    },
  });
}

export function createSubAdminAssignment(data: { userId: string; collegeId: string; appointedById: string }) {
  return prisma.subAdminAssignment.create({
    data: {
      userId: data.userId,
      collegeId: data.collegeId,
      appointedById: data.appointedById,
      isActive: true,
    },
  });
}

export function createSubAdminAssignmentWithRoleUpdate(data: {
  userId: string;
  collegeId: string;
  appointedById: string;
  role: Prisma.UserCreateInput["role"];
}) {
  return prisma.$transaction(async (tx) => {
    const assignment = await tx.subAdminAssignment.create({
      data: {
        userId: data.userId,
        collegeId: data.collegeId,
        appointedById: data.appointedById,
        isActive: true,
      },
    });

    await tx.user.update({
      where: { id: data.userId },
      data: { role: data.role },
    });

    return assignment;
  });
}

export function findSubAdminAssignmentById(id: string) {
  return prisma.subAdminAssignment.findUnique({
    where: { id },
  });
}

export function updateSubAdminAssignmentRevocation(id: string, revokedById: string) {
  return prisma.subAdminAssignment.update({
    where: { id },
    data: {
      revokedById,
      revokedAt: new Date(),
      isActive: false,
    },
  });
}
