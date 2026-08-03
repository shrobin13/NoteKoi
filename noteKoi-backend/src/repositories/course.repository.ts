import { prisma } from "../prisma/prisma.js";

export function findCoursesByDepartment(departmentId: string) {
  return prisma.course.findMany({
    where: { departmentId },
    orderBy: { createdAt: "desc" },
  });
}

export function findCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
  });
}

export function createCourse(data: { departmentId: string; name: string; description?: string | null }) {
  return prisma.course.create({
    data: {
      departmentId: data.departmentId,
      name: data.name,
      description: data.description ?? null,
    },
  });
}

export function updateCourse(id: string, data: { name?: string; description?: string | null }) {
  return prisma.course.update({
    where: { id },
    data,
  });
}
