import { prisma } from "../prisma/prisma.js";

export function findColleges() {
  return prisma.college.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export function findCollegeById(id: string) {
  return prisma.college.findUnique({
    where: { id },
  });
}

export function createCollege(data: { name: string; isActive?: boolean }) {
  return prisma.college.create({
    data: {
      name: data.name,
      isActive: data.isActive ?? true,
    },
  });
}

export function updateCollege(id: string, data: { name?: string; isActive?: boolean }) {
  return prisma.college.update({
    where: { id },
    data,
  });
}
