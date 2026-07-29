import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../types/index.js";

type ValidationTarget = "body" | "params" | "query";

/**
 * Layer-1 of the 4-layer guard stack (ai-context.md §6).
 * Validates req[target] against a Zod schema before any DB calls are made.
 */
export function validate(
  schema: ZodSchema,
  target: ValidationTarget = "body",
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(
        new ApiError(400, "Validation failed", "VALIDATION_ERROR"),
      );
    }
    (req as any)[target] = result.data;
    next();
  };
}

/**
 * Validate with detailed field errors returned in the response body.
 */
export function validateWithDetails(
  schema: ZodSchema,
  target: ValidationTarget = "body",
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const formatted = (result.error as ZodError).flatten();
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: formatted.fieldErrors,
      });
    }
    (req as any)[target] = result.data;
    next();
  };
}
