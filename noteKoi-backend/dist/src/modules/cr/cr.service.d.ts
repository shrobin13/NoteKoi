import type { AssignCRDto, DemoteCRDto } from "./cr.schema.js";
/**
 * R-017: Only the college's Sub Admin or Owner Admin (fallback) may assign a CR.
 * INV-003: Max 2 active CR seats per ClassroomUnit (1 MAIN + 1 CO).
 * Enforced here in a DB transaction + partial unique index CRAssignment_unit_seat_active_unique.
 *
 * R-015/R-016: Main and Co-CR are permission-identical — no branch on seat value
 * for permission logic.
 */
export declare function assignCR(dto: AssignCRDto, actorId: string): Promise<{
    id: string;
    userId: string;
    classroomUnitId: string;
    seat: import("../../../generated/prisma/index.js").$Enums.CrSeat;
    isActive: boolean;
    assignedById: string;
    createdAt: Date;
    updatedAt: Date;
    revokedAt: Date | null;
}>;
/**
 * R-017: Demote CR back to Student.
 */
export declare function demoteCR(dto: DemoteCRDto, actorId: string): Promise<void>;
export declare function listCRsForUnit(classroomUnitId: string): Promise<({
    user: {
        email: string;
        id: string;
        name: string;
    };
} & {
    id: string;
    userId: string;
    classroomUnitId: string;
    seat: import("../../../generated/prisma/index.js").$Enums.CrSeat;
    isActive: boolean;
    assignedById: string;
    createdAt: Date;
    updatedAt: Date;
    revokedAt: Date | null;
})[]>;
//# sourceMappingURL=cr.service.d.ts.map