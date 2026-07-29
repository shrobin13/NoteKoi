// ─── ApiError ────────────────────────────────────────────────────────────────
// A structured error that the global errorHandler serialises to JSON.
// Use this everywhere instead of throwing raw Error objects.
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  // Factory helpers
  static badRequest(message: string, code?: string) {
    return new ApiError(400, message, code);
  }
  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }
  static forbidden(message = "Forbidden") {
    return new ApiError(403, message, "FORBIDDEN");
  }
  static notFound(message = "Not found") {
    return new ApiError(404, message, "NOT_FOUND");
  }
  static conflict(message: string, code?: string) {
    return new ApiError(409, message, code ?? "CONFLICT");
  }
  static internal(message = "Internal server error") {
    return new ApiError(500, message, "INTERNAL");
  }
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function paginate(page: number, limit: number) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

// ─── Success response helper ──────────────────────────────────────────────────
export function success<T>(
  data: T,
  message?: string,
): { success: true; message?: string; data: T } {
  return { success: true, ...(message ? { message } : {}), data };
}

export function getParam(req: { params: Record<string, any> }, key: string): string {
  const val = req.params[key];
  if (Array.isArray(val)) return val[0] || "";
  return val || "";
}

