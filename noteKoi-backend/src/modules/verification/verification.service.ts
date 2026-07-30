import prisma from "../../lib/prisma.js";
import { ApiError, paginate } from "../../types/index.js";
import { AuditAction, Role, VerificationStatus } from "../../../generated/prisma/index.js";
import type { RequestVerificationDto } from "./verification.schema.js";

/**
 * R-028: Student submits a verification request for their ClassroomUnit.
 * Note: A request is also auto-created at registration — this allows
 * re-requesting if the unit changes or if there's a stale request.
 */
export async function requestVerification(userId: string, dto: RequestVerificationDto) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  if (user.verificationStatus === VerificationStatus.VERIFIED) {
    // R-030: idempotent — already verified, return success without reprocessing
    return { message: "Account is already verified", alreadyVerified: true };
  }

  const unit = await prisma.classroomUnit.findUnique({
    where: { id: dto.classroomUnitId },
    include: { department: { select: { collegeId: true } } },
  });
  if (!unit) throw ApiError.notFound("ClassroomUnit not found");
  if (unit.department.collegeId !== user.collegeId) {
    throw ApiError.badRequest("ClassroomUnit does not belong to your college");
  }

  // Upsert: avoid duplicate requests (@@unique([userId, classroomUnitId]))
  const existing = await prisma.verificationRequest.findUnique({
    where: { userId_classroomUnitId: { userId, classroomUnitId: dto.classroomUnitId } },
  });
  if (existing) {
    if (existing.status === VerificationStatus.PENDING) {
      return { message: "Verification request already pending", request: existing };
    }
  }

  const request = await prisma.verificationRequest.upsert({
    where: { userId_classroomUnitId: { userId, classroomUnitId: dto.classroomUnitId } },
    create: { userId, classroomUnitId: dto.classroomUnitId, status: VerificationStatus.PENDING },
    update: { status: VerificationStatus.PENDING, resolvedById: null, resolvedAt: null },
  });

  // Update user's classroomUnitId to the requested one
  await prisma.user.update({
    where: { id: userId },
    data: { classroomUnitId: dto.classroomUnitId },
  });

  return { request };
}

/**
 * R-029: Fallback order — CR of the unit → Sub Admin of the college → Owner Admin.
 * This function validates that the approver has rights over this request.
 * R-030: Approving an already-VERIFIED account is idempotent.
 */
export async function approveVerification(requestId: string, approverId: string) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.verificationRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        classroomUnit: {
          include: { department: { select: { collegeId: true } } },
        },
      },
    });
    if (!request) throw ApiError.notFound("Verification request not found");

    // R-030: idempotent re-approval
    if (request.status === VerificationStatus.VERIFIED) {
      return { message: "Request was already approved", alreadyApproved: true };
    }

    // Validate approver has scope
    const approver = await tx.user.findUnique({ where: { id: approverId } });
    if (!approver) throw ApiError.unauthorized();

    await validateApproverScope(approver, request.classroomUnit, request.classroomUnit.department.collegeId);

    // Approve the request
    const updated = await tx.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: VerificationStatus.VERIFIED,
        resolvedById: approverId,
        resolvedAt: new Date(),
      },
    });

    // Update the user's verificationStatus
    await tx.user.update({
      where: { id: request.userId },
      data: { verificationStatus: VerificationStatus.VERIFIED },
    });

    await tx.auditLog.create({
      data: {
        actorId: approverId,
        action: AuditAction.VERIFY,
        targetUserId: request.userId,
        metadata: {
          classroomUnitId: request.classroomUnitId,
          requestId,
        },
      },
    });

    return { request: updated };
  });
}

/**
 * Reject a pending verification request (CR, Sub Admin, or Owner Admin).
 */
export async function rejectVerification(requestId: string, rejectorId: string) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.verificationRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        classroomUnit: {
          include: { department: { select: { collegeId: true } } },
        },
      },
    });
    if (!request) throw ApiError.notFound("Verification request not found");

    if (request.status !== VerificationStatus.PENDING) {
      return { message: "Request is not in pending state", skipped: true };
    }

    const rejector = await tx.user.findUnique({ where: { id: rejectorId } });
    if (!rejector) throw ApiError.unauthorized();

    await validateApproverScope(rejector, request.classroomUnit, request.classroomUnit.department.collegeId);

    const updated = await tx.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: VerificationStatus.REJECTED,
        resolvedById: rejectorId,
        resolvedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: rejectorId,
        action: AuditAction.VERIFY,
        targetUserId: request.userId,
        metadata: {
          outcome: "REJECTED",
          classroomUnitId: request.classroomUnitId,
          requestId,
        },
      },
    });

    return { request: updated };
  });
}

async function validateApproverScope(
  approver: { id: string; role: Role; collegeId: string },
  unit: { id: string },
  unitCollegeId: string,
) {
  // Owner Admin: platform-wide fallback — no scope restriction
  if (approver.role === Role.OWNER_ADMIN) return;

  // CR: must have an active assignment for this exact unit (R-021)
  if (approver.role === Role.CR) {
    const assignment = await prisma.cRAssignment.findFirst({
      where: { userId: approver.id, classroomUnitId: unit.id, isActive: true },
    });
    if (!assignment) {
      throw ApiError.forbidden("You are not a CR for this ClassroomUnit");
    }
    return;
  }

  // Sub Admin: must belong to the same college (R-010)
  if (approver.role === Role.SUB_ADMIN) {
    if (approver.collegeId !== unitCollegeId) {
      throw ApiError.forbidden("This ClassroomUnit is outside your college scope");
    }
    return;
  }

  throw ApiError.forbidden("You are not authorized to verify accounts");
}

/**
 * Get pending verification requests scoped to the approver.
 */
export async function getPendingRequests(
  approverId: string,
  approverRole: Role,
  approverCollegeId: string,
  approverClassroomUnitId: string | null,
  pagination: { page: number; limit: number },
) {
  const { skip, take } = paginate(pagination.page, pagination.limit);

  let whereClause: object = { status: VerificationStatus.PENDING };

  if (approverRole === Role.CR) {
    // CR sees only their own unit's pending requests
    if (!approverClassroomUnitId) {
      throw ApiError.forbidden("CR has no classroom unit assigned");
    }
    whereClause = { ...whereClause, classroomUnitId: approverClassroomUnitId };
  } else if (approverRole === Role.SUB_ADMIN) {
    // Sub Admin sees all pending requests within their college
    whereClause = {
      ...whereClause,
      classroomUnit: { department: { collegeId: approverCollegeId } },
    };
  }
  // Owner Admin sees all — no additional filter

  const [data, total] = await prisma.$transaction([
    prisma.verificationRequest.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, name: true, email: true, collegeId: true } },
        classroomUnit: {
          select: {
            id: true,
            department: { select: { id: true, name: true } },
            session: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.verificationRequest.count({ where: whereClause }),
  ]);

  return {
    data,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}
