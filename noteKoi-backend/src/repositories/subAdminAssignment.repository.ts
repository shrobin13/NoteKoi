import { prisma } from "../prisma/prisma.js";

export function findActiveSubAdminAssignmentByCollege(collegeId: string) {
  return prisma.subAdminAssignment.findFirst({
    where: {
      collegeId,
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
