// ─── ApiError ────────────────────────────────────────────────────────────────
// A structured error that the global errorHandler serialises to JSON.
// Use this everywhere instead of throwing raw Error objects.
export class ApiError extends Error {
    statusCode;
    code;
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = "ApiError";
    }
    // Factory helpers
    static badRequest(message, code) {
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
    static conflict(message, code) {
        return new ApiError(409, message, code ?? "CONFLICT");
    }
    static internal(message = "Internal server error") {
        return new ApiError(500, message, "INTERNAL");
    }
}
export function paginate(page, limit) {
    const skip = (page - 1) * limit;
    return { skip, take: limit };
}
// ─── Success response helper ──────────────────────────────────────────────────
export function success(data, message) {
    return { success: true, ...(message ? { message } : {}), data };
}
export function getParam(req, key) {
    const val = req.params[key];
    if (Array.isArray(val))
        return val[0] || "";
    return val || "";
}
