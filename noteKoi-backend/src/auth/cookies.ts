import crypto from "crypto";
import type { Response } from "express";
import { ACCESS_TOKEN_COOKIE, CSRF_COOKIE, REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS } from "../config/cookies.js";

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 1000 * 60 * 15,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

export function setCsrfCookie(res: Response) {
  const csrfToken = crypto.randomBytes(24).toString("hex");
  res.cookie(CSRF_COOKIE, csrfToken, {
    ...COOKIE_OPTIONS,
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookies(res: Response) {
  res.cookie(ACCESS_TOKEN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  res.cookie(REFRESH_TOKEN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  res.cookie(CSRF_COOKIE, "", { ...COOKIE_OPTIONS, httpOnly: false, maxAge: 0 });
}
