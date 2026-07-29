import jwt from "jsonwebtoken";
import { env } from "../config/index.js";
import { ApiError } from "../types/index.js";
import { VerificationStatus } from "../../generated/prisma/index.js";
/**
 * Layer-2 of the 4-layer guard stack (ai-context.md §6).
 *
 * Verifies the Bearer access token and attaches the decoded payload to
 * `req.user`. Optionally enforces `verificationStatus === VERIFIED` for
 * endpoints that require it (INV-005).
 */
export function authenticate(opts = {}) {
    return (req, _res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return next(ApiError.unauthorized("Missing or malformed Authorization header"));
        }
        const token = authHeader.slice(7);
        let decoded;
        try {
            decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
        }
        catch {
            return next(ApiError.unauthorized("Invalid or expired access token"));
        }
        if (decoded.type !== "access") {
            return next(ApiError.unauthorized("Token type mismatch"));
        }
        req.user = {
            id: decoded.sub,
            role: decoded.role,
            verificationStatus: decoded.verificationStatus,
            collegeId: decoded.collegeId,
            classroomUnitId: decoded.classroomUnitId,
        };
        // INV-005: private-resource endpoints must reject unverified users
        if (opts.requireVerified && decoded.verificationStatus !== VerificationStatus.VERIFIED) {
            return next(ApiError.forbidden("Your account must be verified before accessing this resource"));
        }
        next();
    };
}
