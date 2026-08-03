import { AppError } from "../errors/app.error.js";
import { createCollege, findCollegeById, findColleges, updateCollege } from "../repositories/college.repository.js";
import { createCollegeDepartment, deleteCollegeDepartment, findCollegeDepartment, findCollegeDepartmentsByCollege } from "../repositories/collegeDepartment.repository.js";
import { findDepartmentById } from "../repositories/department.repository.js";

export async function listColleges() {
  return findColleges();
}

export async function createCollegeRecord(data: { name: string; isActive?: boolean }) {
  const existing = await findColleges();
  const duplicate = existing.find((college) => college.name.toLowerCase() === data.name.trim().toLowerCase());
  if (duplicate) {
    throw new AppError("College already exists", 409, "COLLEGE_EXISTS");
  }

  return createCollege({ name: data.name.trim(), isActive: data.isActive });
}

export async function updateCollegeRecord(id: string, data: { name?: string; isActive?: boolean }) {
  const existing = await findCollegeById(id);
  if (!existing) {
    throw new AppError("College not found", 404, "COLLEGE_NOT_FOUND");
  }

  return updateCollege(id, {
    name: data.name?.trim(),
    isActive: data.isActive,
  });
}

export async function listCollegeDepartments(collegeId: string) {
  await ensureCollegeExists(collegeId);
  return findCollegeDepartmentsByCollege(collegeId);
}

export async function adoptDepartmentIntoCollege(collegeId: string, departmentId: string) {
  await ensureCollegeExists(collegeId);

  const department = await findDepartmentById(departmentId);
  if (!department) {
    throw new AppError("Department not found", 404, "DEPARTMENT_NOT_FOUND");
  }

  const existing = await findCollegeDepartment(collegeId, departmentId);
  if (existing) {
    throw new AppError("Department already adopted by this college", 409, "DEPARTMENT_ALREADY_ADOPTED");
  }

  return createCollegeDepartment(collegeId, departmentId);
}

export async function revokeDepartmentFromCollege(collegeId: string, departmentId: string) {
  await ensureCollegeExists(collegeId);

  const existing = await findCollegeDepartment(collegeId, departmentId);
  if (!existing) {
    throw new AppError("Department is not adopted by this college", 404, "ADOPTION_NOT_FOUND");
  }

  return deleteCollegeDepartment(collegeId, departmentId);
}

async function ensureCollegeExists(collegeId: string) {
  const college = await findCollegeById(collegeId);
  if (!college) {
    throw new AppError("College not found", 404, "COLLEGE_NOT_FOUND");
  }
}
