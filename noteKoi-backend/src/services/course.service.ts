import { AppError } from "../errors/app.error.js";
import { createCourse, findCourseById, findCoursesByDepartment, updateCourse } from "../repositories/course.repository.js";

export async function listCoursesByDepartment(departmentId: string) {
  return findCoursesByDepartment(departmentId);
}

export async function createCourseRecord(data: { departmentId: string; name: string; description?: string | null }) {
  const existing = await findCoursesByDepartment(data.departmentId);
  const duplicate = existing.find((course) => course.name.toLowerCase() === data.name.trim().toLowerCase());
  if (duplicate) {
    throw new AppError("Course already exists for this department", 409, "COURSE_EXISTS");
  }

  return createCourse({ departmentId: data.departmentId, name: data.name.trim(), description: data.description });
}

export async function updateCourseRecord(id: string, data: { name?: string; description?: string | null }) {
  const existing = await findCourseById(id);
  if (!existing) {
    throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
  }

  return updateCourse(id, {
    name: data.name?.trim(),
    description: data.description,
  });
}
