import { AppError } from "../errors/app.error.js";
import { createSession, findSessionById, findSessionsByDepartment, updateSession } from "../repositories/session.repository.js";

export async function listSessionsByDepartment(departmentId: string) {
  return findSessionsByDepartment(departmentId);
}

export async function createSessionRecord(data: { departmentId: string; label: string; isOpen?: boolean }) {
  const existing = await findSessionsByDepartment(data.departmentId);
  const duplicate = existing.find((session) => session.label.toLowerCase() === data.label.trim().toLowerCase());
  if (duplicate) {
    throw new AppError("Session already exists for this department", 409, "SESSION_EXISTS");
  }

  return createSession({ departmentId: data.departmentId, label: data.label.trim(), isOpen: data.isOpen });
}

export async function updateSessionRecord(id: string, data: { label?: string; isOpen?: boolean }) {
  const existing = await findSessionById(id);
  if (!existing) {
    throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
  }

  return updateSession(id, {
    label: data.label?.trim(),
    isOpen: data.isOpen,
  });
}
