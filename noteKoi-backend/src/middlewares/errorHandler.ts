import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";
import { logger } from "../config/logger.js";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    logger.warn({ err, path: req.path }, "Handled error");
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        fields: err.fields ?? [],
      },
    });
  }

  logger.error({ err, path: req.path }, "Unhandled exception");
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
  });
}
