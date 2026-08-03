import { AppError } from "../errors/app.error.js";
import { findActiveSubAdminAssignmentByCollege, findSubAdminAssignmentById, createSubAdminAssignmentWithRoleUpdate, updateSubAdminAssignmentRevocation } from "../repositories/subAdminAssignment.repository.js";
import { findUserById } from "../repositories/user.repository.js";
import { $Enums } from "../../generated/prisma/client.js";

export async function appointSubAdmin(actor: { userId: string; collegeId?: string | null }, input: { userId: string; collegeId: string }) {
  if (!actor.userId) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const actorUser = await findUserById(actor.userId);
  if (!actorUser || actorUser.role !== $Enums.Role.PLATFORM_ADMIN) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const targetUser = await findUserById(input.userId);
  if (!targetUser) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (targetUser.collegeId !== input.collegeId) {
    throw new AppError("Target user must belong to the selected college", 422, "COLLEGE_MISMATCH");
  }

  const existingAssignment = await findActiveSubAdminAssignmentByCollege(input.collegeId);
  if (existingAssignment) {
    throw new AppError("An active sub admin already exists for this college", 409, "SUB_ADMIN_ALREADY_EXISTS");
  }

  const assignment = await createSubAdminAssignmentWithRoleUpdate({
    userId: input.userId,
    collegeId: input.collegeId,
    appointedById: actor.userId,
    role: $Enums.Role.SUB_ADMIN,
  });

  return assignment;
}

export async function revokeSubAdmin(actor: { userId: string }, assignmentId: string) {
  if (!actor.userId) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const actorUser = await findUserById(actor.userId);
  if (!actorUser || actorUser.role !== $Enums.Role.PLATFORM_ADMIN) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const assignment = await findSubAdminAssignmentById(assignmentId);
  if (!assignment) {
    throw new AppError("Assignment not found", 404, "ASSIGNMENT_NOT_FOUND");
  }

  const updatedAssignment = await updateSubAdminAssignmentRevocation(assignmentId, actor.userId);
  return updatedAssignment;
}
