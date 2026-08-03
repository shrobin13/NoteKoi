import { AppError } from "../errors/app.error.js";
import { createDepartment, findDepartmentById, findDepartments, updateDepartment } from "../repositories/department.repository.js";

export async function listDepartments() {
  return findDepartments();
}

export async function createDepartmentRecord(data: { name: string }) {
  const existing = await findDepartments();
  const duplicate = existing.find((department) => department.name.toLowerCase() === data.name.trim().toLowerCase());
  if (duplicate) {
    throw new AppError("Department already exists", 409, "DEPARTMENT_EXISTS");
  }

  return createDepartment({ name: data.name.trim() });
}

export async function updateDepartmentRecord(id: string, data: { name?: string }) {
  const existing = await findDepartmentById(id);
  if (!existing) {
    throw new AppError("Department not found", 404, "DEPARTMENT_NOT_FOUND");
  }

  return updateDepartment(id, {
    name: data.name?.trim(),
  });
}
