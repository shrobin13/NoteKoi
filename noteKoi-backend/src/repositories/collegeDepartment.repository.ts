import { prisma } from "../prisma/prisma.js";

export function findCollegeDepartment(collegeId: string, departmentId: string) {
  return prisma.collegeDepartment.findFirst({
    where: {
      collegeId,
      departmentId,
    },
  });
}
