import rateLimit from "express-rate-limit";
/**
 * Strict rate limiter for auth endpoints (login, register, refresh).
 * Prevents brute-force attacks.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes",
        code: "RATE_LIMIT_EXCEEDED",
    },
});
/**
 * General API rate limiter — applied globally.
 */
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please slow down",
        code: "RATE_LIMIT_EXCEEDED",
    },
});
