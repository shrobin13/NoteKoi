import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/index.js";
import { ApiError } from "../types/index.js";
import { logger } from "../lib/logger.js";
/**
 * Global error handler — must be registered last in the Express app.
 * Express identifies error handling middleware by requiring 4 parameters: (err, req, res, next).
 */
export function errorHandler(err, req, res, _next) {
    // ── ApiError (our own structured errors) ──────────────────────────────────
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.code ? { code: err.code } : {}),
        });
        return;
    }
    // ── Zod validation errors ──────────────────────────────────────────────────
    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            errors: err.flatten().fieldErrors,
        });
        return;
    }
    // ── Prisma known errors ────────────────────────────────────────────────────
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            res.status(409).json({
                success: false,
                message: "A record with this value already exists",
                code: "UNIQUE_CONSTRAINT_VIOLATION",
            });
            return;
        }
        if (err.code === "P2025") {
            res.status(404).json({
                success: false,
                message: "Record not found",
                code: "NOT_FOUND",
            });
            return;
        }
        if (err.code === "P2003") {
            res.status(400).json({
                success: false,
                message: "Referenced record does not exist",
                code: "FOREIGN_KEY_VIOLATION",
            });
            return;
        }
    }
    // ── Unexpected errors ──────────────────────────────────────────────────────
    logger.error("Unhandled error", {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        path: req.path,
        method: req.method,
    });
    res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
        code: "INTERNAL_SERVER_ERROR",
    });
}
