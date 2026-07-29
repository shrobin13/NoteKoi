import { Request, Response, NextFunction } from "express";
import { Role, VerificationStatus } from "../../generated/prisma/index.js";
export interface JwtPayload {
    sub: string;
    role: Role;
    verificationStatus: VerificationStatus;
    collegeId: string;
    classroomUnitId: string | null;
    type: "access";
}
/**
 * Layer-2 of the 4-layer guard stack (ai-context.md §6).
 *
 * Verifies the Bearer access token and attaches the decoded payload to
 * `req.user`. Optionally enforces `verificationStatus === VERIFIED` for
 * endpoints that require it (INV-005).
 */
export declare function authenticate(opts?: {
    requireVerified?: boolean;
}): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=authenticate.d.ts.map