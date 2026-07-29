import type { AssignSubAdminDto, TransferOwnershipDto } from "./admin.schema.js";
/**
 * R-003: Owner Admin promotes a verified user to Sub Admin.
 * INV-002: At most one active Sub Admin per college — enforced here in a
 * transaction + the partial unique index AdminAssignment_college_subadmin_active_unique.
 */
export declare function assignSubAdmin(dto: AssignSubAdminDto, actorId: string): Promise<{
    id: string;
    userId: string;
    role: import("../../../generated/prisma/index.js").$Enums.AdminRole;
    collegeId: string | null;
    isActive: boolean;
    assignedById: string;
    createdAt: Date;
    updatedAt: Date;
    revokedAt: Date | null;
}>;
/**
 * R-003: Owner Admin demotes a Sub Admin back to Student.
 */
export declare function demoteSubAdmin(userId: string, actorId: string): Promise<void>;
/**
 * R-004: Atomic ownership transfer — prior Owner Admin is demoted and new one
 * promoted in a single transaction. INV-001 must never be violated mid-transfer.
 */
export declare function transferOwnership(dto: TransferOwnershipDto, actorId: string): Promise<void>;
/**
 * R-006: Platform-wide statistics for Owner Admin only.
 * INV-009: PersonalShare stats are count-only — no content ever exposed.
 */
export declare function getPlatformStats(): Promise<{
    users: {
        total: number;
        verified: number;
        pending: number;
        byRole: {
            role: import("../../../generated/prisma/index.js").$Enums.Role;
            count: number;
        }[];
    };
    structure: {
        colleges: number;
        departments: number;
        classroomUnits: number;
    };
    content: {
        resources: number;
        personalShares: number;
    };
}>;
export declare function listSubAdmins(): Promise<({
    college: {
        id: string;
        name: string;
    } | null;
    user: {
        collegeId: string;
        email: string;
        id: string;
        name: string;
    };
} & {
    id: string;
    userId: string;
    role: import("../../../generated/prisma/index.js").$Enums.AdminRole;
    collegeId: string | null;
    isActive: boolean;
    assignedById: string;
    createdAt: Date;
    updatedAt: Date;
    revokedAt: Date | null;
})[]>;
//# sourceMappingURL=admin.service.d.ts.map