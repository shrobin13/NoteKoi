import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
type ValidationTarget = "body" | "params" | "query";
/**
 * Layer-1 of the 4-layer guard stack (ai-context.md §6).
 * Validates req[target] against a Zod schema before any DB calls are made.
 */
export declare function validate(schema: ZodSchema, target?: ValidationTarget): (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Validate with detailed field errors returned in the response body.
 */
export declare function validateWithDetails(schema: ZodSchema, target?: ValidationTarget): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=validate.d.ts.map