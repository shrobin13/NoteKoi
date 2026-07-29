import prisma from "../../lib/prisma.js";
import { ApiError } from "../../types/index.js";
import { AuditAction, Role, VerificationStatus } from "../../../generated/prisma/index.js";
/**
 * R-017: Only the college's Sub Admin or Owner Admin (fallback) may assign a CR.
 * INV-003: Max 2 active CR seats per ClassroomUnit (1 MAIN + 1 CO).
 * Enforced here in a DB transaction + partial unique index CRAssignment_unit_seat_active_unique.
 *
 * R-015/R-016: Main and Co-CR are permission-identical — no branch on seat value
 * for permission logic.
 */
export async function assignCR(dto, actorId) {
    return prisma.$transaction(async (tx) => {
        // Verify target user is VERIFIED and belongs to the college of this unit
        const targetUser = await tx.user.findUnique({ where: { id: dto.userId } });
        if (!targetUser)
            throw ApiError.notFound("User not found");
        if (targetUser.verificationStatus !== VerificationStatus.VERIFIED) {
            throw ApiError.badRequest("User must be verified before being assigned as CR");
        }
        // Verify classroom unit exists
        const unit = await tx.classroomUnit.findUnique({
            where: { id: dto.classroomUnitId },
            include: { department: { select: { collegeId: true } } },
        });
        if (!unit)
            throw ApiError.notFound("ClassroomUnit not found");
        // User must belong to the same college as the classroom unit
        if (targetUser.collegeId !== unit.department.collegeId) {
            throw ApiError.badRequest("User must belong to the same college as the ClassroomUnit");
        }
        // INV-003: Pre-check — is the requested seat already taken?
        const existingSeat = await tx.cRAssignment.findFirst({
            where: {
                classroomUnitId: dto.classroomUnitId,
                seat: dto.seat,
                isActive: true,
            },
        });
        if (existingSeat) {
            throw ApiError.conflict(`The ${dto.seat} seat for this ClassroomUnit is already occupied`, "CR_SEAT_TAKEN");
        }
        // Check user doesn't already hold an active CR seat in this unit
        const userExistingAssignment = await tx.cRAssignment.findFirst({
            where: { userId: dto.userId, classroomUnitId: dto.classroomUnitId, isActive: true },
        });
        if (userExistingAssignment) {
            throw ApiError.conflict("User already holds a CR seat in this ClassroomUnit", "USER_ALREADY_CR");
        }
        // Promote user role to CR
        await tx.user.update({
            where: { id: dto.userId },
            data: { role: Role.CR, classroomUnitId: dto.classroomUnitId },
        });
        const assignment = await tx.cRAssignment.create({
            data: {
                userId: dto.userId,
                classroomUnitId: dto.classroomUnitId,
                seat: dto.seat,
                assignedById: actorId,
                isActive: true,
            },
        });
        await tx.auditLog.create({
            data: {
                actorId,
                action: AuditAction.PROMOTE,
                targetUserId: dto.userId,
                previousRole: targetUser.role,
                newRole: Role.CR,
                metadata: { classroomUnitId: dto.classroomUnitId, seat: dto.seat },
            },
        });
        return assignment;
    });
}
/**
 * R-017: Demote CR back to Student.
 */
export async function demoteCR(dto, actorId) {
    return prisma.$transaction(async (tx) => {
        const assignment = await tx.cRAssignment.findFirst({
            where: {
                userId: dto.userId,
                classroomUnitId: dto.classroomUnitId,
                isActive: true,
            },
        });
        if (!assignment)
            throw ApiError.notFound("No active CR assignment found");
        // Revoke
        await tx.cRAssignment.update({
            where: { id: assignment.id },
            data: { isActive: false, revokedAt: new Date() },
        });
        // Back to Student
        await tx.user.update({
            where: { id: dto.userId },
            data: { role: Role.STUDENT, classroomUnitId: dto.classroomUnitId },
        });
        await tx.auditLog.create({
            data: {
                actorId,
                action: AuditAction.DEMOTE,
                targetUserId: dto.userId,
                previousRole: Role.CR,
                newRole: Role.STUDENT,
                metadata: { classroomUnitId: dto.classroomUnitId, seat: assignment.seat },
            },
        });
    });
}
export async function listCRsForUnit(classroomUnitId) {
    return prisma.cRAssignment.findMany({
        where: { classroomUnitId, isActive: true },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });
}
