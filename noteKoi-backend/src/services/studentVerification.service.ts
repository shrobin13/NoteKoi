import { AppError } from "../errors/app.error.js";
import { findActiveCrCoCrAssignmentsByCollege, findActiveCrCoCrAssignmentsForUser } from "../repositories/crCoCrAssignment.repository.js";
import { findActiveSubAdminAssignmentByCollege } from "../repositories/subAdminAssignment.repository.js";
import { findPendingStudentsByCollege, findPendingTeachersByCollege, findUserById, updateUserVerification, updateTeacherVerificationStatus } from "../repositories/user.repository.js";

function buildUserDto(user: {
  id: string;
  email: string;
  role: string;
  collegeId?: string | null;
  departmentId?: string | null;
  sessionId?: string | null;
  isVerified: boolean;
  teacherVerificationStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    collegeId: user.collegeId,
    departmentId: user.departmentId,
    sessionId: user.sessionId,
    isVerified: user.isVerified,
    teacherVerificationStatus: user.teacherVerificationStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function buildPendingStudentDto(user: {
  id: string;
  name?: string | null;
  email: string;
  regNo?: string | null;
  createdAt: Date;
  college?: { name?: string | null } | null;
}) {
  return {
    userId: user.id,
    name: user.name ?? undefined,
    email: user.email,
    regNo: user.regNo ?? "",
    college: user.college?.name ?? undefined,
    createdAt: user.createdAt,
  };
}

export async function listStudentVerificationsForCr(user: { userId: string; collegeId?: string | null }) {
  const assignments = await findActiveCrCoCrAssignmentsForUser(user.userId);
  if (assignments.length === 0) {
    return [];
  }

  const pendingStudents = await Promise.all(
    assignments.map((assignment) =>
      findPendingStudentsByCollege(assignment.collegeId ?? user.collegeId ?? "", assignment.departmentId, assignment.sessionId),
    ),
  );

  return pendingStudents.flat().map(buildPendingStudentDto);
}

export async function listStudentVerificationsForSubAdmin(user: { collegeId?: string | null }) {
  const collegeId = user.collegeId;
  if (!collegeId) {
    return [];
  }

  const pendingStudents = await findPendingStudentsByCollege(collegeId);
  const scopedStudents = [] as Awaited<ReturnType<typeof findPendingStudentsByCollege>>;

  for (const student of pendingStudents) {
    const assignment = await findActiveCrCoCrAssignmentsForUserByScope(collegeId, student.departmentId ?? "", student.sessionId ?? "");
    if (!assignment) {
      scopedStudents.push(student);
    }
  }

  return scopedStudents.map(buildPendingStudentDto);
}

export async function approveStudentVerification(actor: { userId: string; collegeId?: string | null }, targetUserId: string) {
  const targetUser = await findUserById(targetUserId);
  if (!targetUser) {
    throw new AppError("Student not found", 404, "USER_NOT_FOUND");
  }

  if (targetUser.isVerified) {
    return buildUserDto(targetUser);
  }

  const assignments = await findActiveCrCoCrAssignmentsForUser(actor.userId);
  const hasCrScope = assignments.some((assignment) => assignment.departmentId === targetUser.departmentId && assignment.sessionId === targetUser.sessionId);

  if (!hasCrScope) {
    const subAdminAssignment = await findActiveSubAdminAssignmentByCollege(actor.collegeId ?? "");
    if (!subAdminAssignment) {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    const fallbackAssignment = await findActiveCrCoCrAssignmentsForUserByScope(actor.collegeId ?? "", targetUser.departmentId ?? "", targetUser.sessionId ?? "");
    if (fallbackAssignment) {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }
  }

  const updatedUser = await updateUserVerification(targetUserId, true);
  return buildUserDto(updatedUser);
}

export async function listPendingTeachersForSubAdmin(user: { collegeId?: string | null }) {
  const collegeId = user.collegeId;
  if (!collegeId) {
    return [];
  }

  const pendingTeachers = await findPendingTeachersByCollege(collegeId);
  return pendingTeachers.map(buildUserDto);
}

export async function approveTeacherVerification(actor: { userId: string; collegeId?: string | null }, targetUserId: string) {
  const targetUser = await findUserById(targetUserId);
  if (!targetUser) {
    throw new AppError("Teacher not found", 404, "USER_NOT_FOUND");
  }

  const subAdminAssignment = await findActiveSubAdminAssignmentByCollege(actor.collegeId ?? "");
  if (!subAdminAssignment) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const updatedUser = await updateTeacherVerificationStatus(targetUserId, "VERIFIED");
  return buildUserDto(updatedUser);
}

async function findActiveCrCoCrAssignmentsForUserByScope(collegeId: string, departmentId: string, sessionId: string) {
  const assignments = await findActiveCrCoCrAssignmentsForUserByCollege(collegeId);
  return assignments.find((assignment) => assignment.departmentId === departmentId && assignment.sessionId === sessionId);
}

async function findActiveCrCoCrAssignmentsForUserByCollege(collegeId: string) {
  return findActiveCrCoCrAssignmentsByCollege(collegeId);
}
