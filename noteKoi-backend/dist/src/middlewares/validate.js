import { ApiError } from "../types/index.js";
/**
 * Layer-1 of the 4-layer guard stack (ai-context.md §6).
 * Validates req[target] against a Zod schema before any DB calls are made.
 */
export function validate(schema, target = "body") {
    return (req, _res, next) => {
        const result = schema.safeParse(req[target]);
        if (!result.success) {
            return next(new ApiError(400, "Validation failed", "VALIDATION_ERROR"));
        }
        req[target] = result.data;
        next();
    };
}
/**
 * Validate with detailed field errors returned in the response body.
 */
export function validateWithDetails(schema, target = "body") {
    return (req, res, next) => {
        const result = schema.safeParse(req[target]);
        if (!result.success) {
            const formatted = result.error.flatten();
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                code: "VALIDATION_ERROR",
                errors: formatted.fieldErrors,
            });
        }
        req[target] = result.data;
        next();
    };
}
