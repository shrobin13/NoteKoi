import type { NextFunction, Request, Response } from "express";
import { ZodError, ZodIssue, type ZodSchema } from "zod";
import { AppError } from "../errors/app.error.js";

type SchemaMap = Partial<{
  body: ZodSchema<unknown>;
  params: ZodSchema<unknown>;
  query: ZodSchema<unknown>;
}>;

export function validate(schemaMap: SchemaMap) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemaMap.params) {
        req.params = schemaMap.params.parse(req.params) as typeof req.params;
      }
      if (schemaMap.query) {
        req.query = schemaMap.query.parse(req.query) as typeof req.query;
      }
      if (schemaMap.body) {
        req.body = schemaMap.body.parse(req.body) as typeof req.body;
      }
      return next();
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        const zodError = error as ZodError;
        const fields = zodError.issues.map((issue: ZodIssue) => ({
          field: issue.path.join(".") || "",
          message: issue.message,
          code: issue.code,
        }));
        return next(new AppError("Validation failed", 400, "VALIDATION_ERROR", fields));
      }
      return next(error);
    }
  };
}
