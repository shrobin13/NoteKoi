import type { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../errors/app.error.js";

type SchemaMap = Partial<{
  body: ZodSchema<any>;
  params: ZodSchema<any>;
  query: ZodSchema<any>;
}>;

export function validate(schemaMap: SchemaMap) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemaMap.params) {
        req.params = schemaMap.params.parse(req.params);
      }
      if (schemaMap.query) {
        req.query = schemaMap.query.parse(req.query);
      }
      if (schemaMap.body) {
        req.body = schemaMap.body.parse(req.body);
      }
      return next();
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        const zodError = error as any;
        const fields = zodError.issues.map((issue: any) => ({
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
