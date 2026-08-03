import { prisma } from "../prisma/prisma.js";

export function findCollegeDepartment(collegeId: string, departmentId: string) {
  return prisma.collegeDepartment.findFirst({
    where: {
      collegeId,
      departmentId,
    },
  });
}

export function findCollegeDepartmentsByCollege(collegeId: string) {
  return prisma.collegeDepartment.findMany({
    where: { collegeId },
  });
}

export function createCollegeDepartment(collegeId: string, departmentId: string) {
  return prisma.collegeDepartment.create({
    data: {
      collegeId,
      departmentId,
    },
  });
}

export function deleteCollegeDepartment(collegeId: string, departmentId: string) {
  return prisma.collegeDepartment.delete({
    where: {
      collegeId_departmentId: {
        collegeId,
        departmentId,
      },
    },
  });
}
