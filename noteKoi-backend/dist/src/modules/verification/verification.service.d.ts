import { Role } from "../../../generated/prisma/index.js";
import type { RequestVerificationDto } from "./verification.schema.js";
/**
 * R-028: Student submits a verification request for their ClassroomUnit.
 * Note: A request is also auto-created at registration — this allows
 * re-requesting if the unit changes or if there's a stale request.
 */
export declare function requestVerification(userId: string, dto: RequestVerificationDto): Promise<{
    message: string;
    alreadyVerified: boolean;
    request?: undefined;
} | {
    alreadyVerified?: undefined;
    message: string;
    request: {
        id: string;
        userId: string;
        classroomUnitId: string;
        status: import("../../../generated/prisma/index.js").$Enums.VerificationStatus;
        resolvedById: string | null;
        resolvedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
} | {
    alreadyVerified?: undefined;
    message?: undefined;
    request: {
        id: string;
        userId: string;
        classroomUnitId: string;
        status: import("../../../generated/prisma/index.js").$Enums.VerificationStatus;
        resolvedById: string | null;
        resolvedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
}>;
/**
 * R-029: Fallback order — CR of the unit → Sub Admin of the college → Owner Admin.
 * This function validates that the approver has rights over this request.
 * R-030: Approving an already-VERIFIED account is idempotent.
 */
export declare function approveVerification(requestId: string, approverId: string): Promise<{
    request?: undefined;
    message: string;
    alreadyApproved: boolean;
} | {
    message?: undefined;
    alreadyApproved?: undefined;
    request: {
        id: string;
        userId: string;
        classroomUnitId: string;
        status: import("../../../generated/prisma/index.js").$Enums.VerificationStatus;
        resolvedById: string | null;
        resolvedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
}>;
/**
 * Get pending verification requests scoped to the approver.
 */
export declare function getPendingRequests(approverId: string, approverRole: Role, approverCollegeId: string, approverClassroomUnitId: string | null, pagination: {
    page: number;
    limit: number;
}): Promise<{
    data: ({
        classroomUnit: {
            department: {
                id: string;
                name: string;
            };
            id: string;
            session: {
                id: string;
                name: string;
            };
        };
        user: {
            collegeId: string;
            email: string;
            id: string;
            name: string;
        };
    } & {
        id: string;
        userId: string;
        classroomUnitId: string;
        status: import("../../../generated/prisma/index.js").$Enums.VerificationStatus;
        resolvedById: string | null;
        resolvedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
//# sourceMappingURL=verification.service.d.ts.map