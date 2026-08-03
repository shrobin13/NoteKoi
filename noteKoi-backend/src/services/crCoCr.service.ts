import { AppError } from "../errors/app.error.js";
import { createCrCoCrAssignment, findCrCoCrAssignmentById, updateCrCoCrAssignmentRevocation } from "../repositories/crCoCrAssignment.repository.js";
import { findUserById } from "../repositories/user.repository.js";
import { $Enums } from "../../generated/prisma/client.js";

export async function appointCrCoCr(actor: { userId: string; collegeId?: string | null }, input: { userId: string; collegeId: string; departmentId: string; sessionId: string; type: "CR" | "CO_CR" }) {
  if (!actor.userId) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const actorUser = await findUserById(actor.userId);
  if (!actorUser || actorUser.role !== $Enums.Role.SUB_ADMIN) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const targetUser = await findUserById(input.userId);
  if (!targetUser || targetUser.role !== $Enums.Role.STUDENT || !targetUser.isVerified) {
    throw new AppError("Verified student required", 422, "VERIFIED_STUDENT_REQUIRED");
  }

  const assignment = await createCrCoCrAssignment({
    userId: input.userId,
    collegeId: input.collegeId,
    departmentId: input.departmentId,
    sessionId: input.sessionId,
    type: input.type === "CO_CR" ? $Enums.CrCoCrType.CO_CR : $Enums.CrCoCrType.CR,
    appointedById: actor.userId,
  });

  return assignment;
}

export async function revokeCrCoCr(actor: { userId: string }, assignmentId: string) {
  if (!actor.userId) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const actorUser = await findUserById(actor.userId);
  if (!actorUser || actorUser.role !== $Enums.Role.SUB_ADMIN) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const assignment = await findCrCoCrAssignmentById(assignmentId);
  if (!assignment) {
    throw new AppError("Assignment not found", 404, "ASSIGNMENT_NOT_FOUND");
  }

  return updateCrCoCrAssignmentRevocation(assignmentId, actor.userId);
}
