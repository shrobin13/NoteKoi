import { prisma } from "../prisma/prisma.js";

export function findDepartments() {
  return prisma.department.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export function findDepartmentById(id: string) {
  return prisma.department.findUnique({
    where: { id },
  });
}

export function createDepartment(data: { name: string }) {
  return prisma.department.create({
    data: {
      name: data.name,
    },
  });
}

export function updateDepartment(id: string, data: { name?: string }) {
  return prisma.department.update({
    where: { id },
    data,
  });
}
