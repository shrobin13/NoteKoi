import { prisma } from "../prisma/prisma.js";

export function findSessionsByDepartment(departmentId: string) {
  return prisma.session.findMany({
    where: { departmentId },
    orderBy: { createdAt: "desc" },
  });
}

export function findSessionById(id: string) {
  return prisma.session.findUnique({
    where: { id },
  });
}

export function createSession(data: { departmentId: string; label: string; isOpen?: boolean }) {
  return prisma.session.create({
    data: {
      departmentId: data.departmentId,
      label: data.label,
      isOpen: data.isOpen ?? true,
    },
  });
}

export function updateSession(id: string, data: { label?: string; isOpen?: boolean }) {
  return prisma.session.update({
    where: { id },
    data,
  });
}
