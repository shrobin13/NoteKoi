import prisma from "../../lib/prisma.js";
import { ApiError } from "../../types/index.js";
import { AdminRole, AuditAction, Role, VerificationStatus } from "@prisma/client";
import type {
  AssignSubAdminDto,
  TransferOwnershipDto,
} from "./admin.schema.js";

// ─── Sub Admin Management ────────────────────────────────────────────────────

/**
 * R-003: Owner Admin promotes a verified user to Sub Admin.
 * INV-002: At most one active Sub Admin per college — enforced here in a
 * transaction + the partial unique index AdminAssignment_college_subadmin_active_unique.
 */
export async function assignSubAdmin(
  dto: AssignSubAdminDto,
  actorId: string,
) {
  return prisma.$transaction(async (tx) => {
    // Verify target user exists, is VERIFIED, and belongs to the college
    const targetUser = await tx.user.findUnique({ where: { id: dto.userId } });
    if (!targetUser) throw ApiError.notFound("User not found");
    if (targetUser.verificationStatus !== VerificationStatus.VERIFIED) {
      throw ApiError.badRequest("User must be verified before being promoted to Sub Admin");
    }
    if (targetUser.collegeId !== dto.collegeId) {
      throw ApiError.badRequest("User must belong to the specified college");
    }

    // Verify college exists
    const college = await tx.college.findUnique({ where: { id: dto.collegeId } });
    if (!college) throw ApiError.notFound("College not found");

    // INV-002: pre-check for active Sub Admin (race-safe with partial unique index backstop)
    const existing = await tx.adminAssignment.findFirst({
      where: { collegeId: dto.collegeId, role: AdminRole.SUB_ADMIN, isActive: true },
    });
    if (existing) {
      throw ApiError.conflict(
        "This college already has an active Sub Admin. Demote them first.",
        "SUB_ADMIN_SEAT_TAKEN",
      );
    }

    // Promote user role
    await tx.user.update({
      where: { id: dto.userId },
      data: { role: Role.SUB_ADMIN },
    });

    // Create assignment
    const assignment = await tx.adminAssignment.create({
      data: {
        userId: dto.userId,
        role: AdminRole.SUB_ADMIN,
        collegeId: dto.collegeId,
        assignedById: actorId,
        isActive: true,
      },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        actorId,
        action: AuditAction.PROMOTE,
        targetUserId: dto.userId,
        previousRole: Role.STUDENT,
        newRole: Role.SUB_ADMIN,
        metadata: { collegeId: dto.collegeId },
      },
    });

    return assignment;
  });
}

/**
 * R-003: Owner Admin demotes a Sub Admin back to Student.
 */
export async function demoteSubAdmin(userId: string, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const assignment = await tx.adminAssignment.findFirst({
      where: { userId, role: AdminRole.SUB_ADMIN, isActive: true },
    });
    if (!assignment) throw ApiError.notFound("No active Sub Admin assignment found for this user");

    // Revoke assignment
    await tx.adminAssignment.update({
      where: { id: assignment.id },
      data: { isActive: false, revokedAt: new Date() },
    });

    // Downgrade user role
    await tx.user.update({
      where: { id: userId },
      data: { role: Role.STUDENT },
    });

    await tx.auditLog.create({
      data: {
        actorId,
        action: AuditAction.DEMOTE,
        targetUserId: userId,
        previousRole: Role.SUB_ADMIN,
        newRole: Role.STUDENT,
        metadata: { collegeId: assignment.collegeId },
      },
    });
  });
}

// ─── Ownership Transfer ───────────────────────────────────────────────────────

/**
 * R-004: Atomic ownership transfer — prior Owner Admin is demoted and new one
 * promoted in a single transaction. INV-001 must never be violated mid-transfer.
 */
export async function transferOwnership(
  dto: TransferOwnershipDto,
  actorId: string,
) {
  if (dto.newOwnerUserId === actorId) {
    throw ApiError.badRequest("Cannot transfer ownership to yourself");
  }

  return prisma.$transaction(async (tx) => {
    const newOwner = await tx.user.findUnique({ where: { id: dto.newOwnerUserId } });
    if (!newOwner) throw ApiError.notFound("Target user not found");
    if (newOwner.verificationStatus !== VerificationStatus.VERIFIED) {
      throw ApiError.badRequest("Target user must be verified");
    }

    // Revoke current Owner Admin assignment
    const currentAssignment = await tx.adminAssignment.findFirst({
      where: { userId: actorId, role: AdminRole.OWNER_ADMIN, isActive: true },
    });
    if (!currentAssignment) throw ApiError.internal("Could not find current Owner Admin assignment");

    await tx.adminAssignment.update({
      where: { id: currentAssignment.id },
      data: { isActive: false, revokedAt: new Date() },
    });

    // Downgrade current actor
    await tx.user.update({
      where: { id: actorId },
      data: { role: Role.STUDENT },
    });

    // Promote new owner
    await tx.user.update({
      where: { id: dto.newOwnerUserId },
      data: { role: Role.OWNER_ADMIN },
    });

    await tx.adminAssignment.create({
      data: {
        userId: dto.newOwnerUserId,
        role: AdminRole.OWNER_ADMIN,
        collegeId: null,
        assignedById: actorId,
        isActive: true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId,
        action: AuditAction.OWNERSHIP_TRANSFER,
        targetUserId: dto.newOwnerUserId,
        previousRole: Role.OWNER_ADMIN,
        newRole: Role.OWNER_ADMIN,
        metadata: { from: actorId, to: dto.newOwnerUserId },
      },
    });
  });
}

// ─── Platform Stats ───────────────────────────────────────────────────────────

/**
 * R-006: Platform-wide statistics for Owner Admin only.
 * INV-009: PersonalShare stats are count-only — no content ever exposed.
 */
export async function getPlatformStats() {
  const [
    userCount,
    verifiedUsers,
    pendingUsers,
    collegeCount,
    departmentCount,
    classroomUnitCount,
    resourceCount,
    personalShareCount,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { verificationStatus: VerificationStatus.VERIFIED } }),
    prisma.user.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
    prisma.college.count(),
    prisma.department.count(),
    prisma.classroomUnit.count(),
    prisma.resource.count(),
    // INV-009: count only, no content selection
    prisma.personalShare.count(),
  ]);

  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: { _all: true },
  });

  return {
    users: {
      total: userCount,
      verified: verifiedUsers,
      pending: pendingUsers,
      byRole: usersByRole.map((r) => ({ role: r.role, count: r._count._all })),
    },
    structure: {
      colleges: collegeCount,
      departments: departmentCount,
      classroomUnits: classroomUnitCount,
    },
    content: {
      resources: resourceCount,
      personalShares: personalShareCount, // count only — R-052, INV-009
    },
  };
}

// ─── Sub Admin list ───────────────────────────────────────────────────────────
export async function listSubAdmins() {
  return prisma.adminAssignment.findMany({
    where: { role: AdminRole.SUB_ADMIN, isActive: true },
    include: {
      user: { select: { id: true, name: true, email: true, collegeId: true } },
      college: { select: { id: true, name: true } },
    },
  });
}
