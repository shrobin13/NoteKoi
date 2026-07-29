import { Request, Response, NextFunction } from "express";
import { Role } from "../../generated/prisma/index.js";
/**
 * Layer-3 of the 4-layer guard stack (ai-context.md §6).
 *
 * Checks that the authenticated user's role is one of the allowed roles.
 * IMPORTANT: Never branch on CrSeat (MAIN vs CO) inside here — that
 * distinction is cosmetic only (R-015, R-016).
 *
 * @example
 *   router.post('/resources', authenticate(), requireRole(Role.CR), ...)
 */
export declare function requireRole(...roles: Role[]): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=requireRole.d.ts.map