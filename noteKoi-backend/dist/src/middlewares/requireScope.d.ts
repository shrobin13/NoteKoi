import { Request, Response, NextFunction } from "express";
type ScopeType = "classroomUnit" | "college";
/**
 * Layer-4 of the 4-layer guard stack (ai-context.md §6).
 *
 * Verifies that the acting user has rights over the specific record they are
 * trying to touch. Scope is resolved via a DB join — never trust the JWT
 * alone for scope checks.
 */
export declare function requireScope(scopeType: ScopeType): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=requireScope.d.ts.map