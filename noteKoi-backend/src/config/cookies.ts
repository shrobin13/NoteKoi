export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const CSRF_COOKIE = "csrf_token";
export const CSRF_HEADER = "x-csrf-token";

const rawDomain = process.env.COOKIE_DOMAIN;
// Don't set domain for localhost — browsers (especially Chrome) reject .localhost cookies
const cookieDomain =
  !rawDomain || rawDomain === "localhost" || rawDomain === ".localhost"
    ? undefined
    : rawDomain;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  domain: cookieDomain,
  path: "/",
};
