import { AppError } from "../errors/app.error.js";
import { createCollege, findCollegeById, findColleges, updateCollege } from "../repositories/college.repository.js";

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
