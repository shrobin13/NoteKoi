/**
 * Strict rate limiter for auth endpoints (login, register, refresh).
 * Prevents brute-force attacks.
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * General API rate limiter — applied globally.
 */
export declare const generalLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimiter.d.ts.map