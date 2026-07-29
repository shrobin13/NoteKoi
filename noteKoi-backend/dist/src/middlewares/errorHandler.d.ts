import { Request, Response, NextFunction } from "express";
/**
 * Global error handler — must be registered last in the Express app.
 * Express identifies error handling middleware by requiring 4 parameters: (err, req, res, next).
 */
export declare function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=errorHandler.d.ts.map