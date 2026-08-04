import { prisma } from "../prisma/prisma.js";
import type { $Enums } from "../../generated/prisma/client.js";

export function findActiveCrCoCrAssignmentsForUser(userId: string) {
  return prisma.crCoCrAssignment.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: { appointedAt: "desc" },
  });
}

export function findActiveCrCoCrAssignmentsByCollege(collegeId: string) {
  return prisma.crCoCrAssignment.findMany({
    where: {
      collegeId,
      isActive: true,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { appointedAt: "desc" },
  });
}

export function createCrCoCrAssignment(data: {
  userId: string;
  collegeId: string;
  departmentId: string;
  sessionId: string;
  type: $Enums.CrCoCrType;
  appointedById: string;
  isEmergencyAppointment?: boolean;
}) {
  return prisma.crCoCrAssignment.create({
    data: {
      userId: data.userId,
      collegeId: data.collegeId,
      departmentId: data.departmentId,
      sessionId: data.sessionId,
      type: data.type,
      appointedById: data.appointedById,
      isEmergencyAppointment: data.isEmergencyAppointment ?? false,
      isActive: true,
    },
  });
}

export function findActiveCrCoCrAssignmentByScope(userId: string, departmentId: string, sessionId: string) {
  return prisma.crCoCrAssignment.findFirst({
    where: {
      userId,
      departmentId,
      sessionId,
      isActive: true,
    },
  });
}

export function findActiveCrCoCrAssignmentByScopeAndType(collegeId: string, departmentId: string, sessionId: string, type: $Enums.CrCoCrType) {
  return prisma.crCoCrAssignment.findFirst({
    where: {
      collegeId,
      departmentId,
      sessionId,
      type,
      isActive: true,
    },
  });
}

export function findCrCoCrAssignmentById(id: string) {
  return prisma.crCoCrAssignment.findUnique({
    where: { id },
  });
}

export function updateCrCoCrAssignmentRevocation(id: string, revokedById: string) {
  return prisma.crCoCrAssignment.update({
    where: { id },
    data: {
      revokedById,
      revokedAt: new Date(),
      isActive: false,
    },
  });
}
