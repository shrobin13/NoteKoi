import type { Request, Response, NextFunction } from "express";
import { login, refreshSession, forgotPassword, resetPassword } from "../services/auth.service.js";
import { ok } from "../helpers/response.js";
import { ACCESS_TOKEN_COOKIE, CSRF_COOKIE, REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS } from "../config/cookies.js";
import crypto from "crypto";

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 1000 * 60 * 15,
  });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

function setCsrfCookie(res: Response) {
  const csrfToken = crypto.randomBytes(24).toString("hex");
  res.cookie(CSRF_COOKIE, csrfToken, {
    ...COOKIE_OPTIONS,
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);

    setAuthCookies(res, result.accessToken, result.refreshToken);
    setCsrfCookie(res);

    return res.status(200).json(ok(result.user));
  } catch (error) {
    return next(error);
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken || typeof refreshToken !== "string") {
      return res.status(401).json({ success: false, error: { code: "UNAUTHENTICATED", message: "Refresh token missing" } });
    }

    const result = await refreshSession(refreshToken);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    setCsrfCookie(res);

    return res.status(200).json(ok(result.user));
  } catch (error) {
    return next(error);
  }
}

export async function forgotPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    await forgotPassword(email);
    return res.status(200).json(ok({ message: "If an account exists for this email, a password reset link has been sent." }));
  } catch (error) {
    return next(error);
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = req.body;
    await resetPassword(token, newPassword);
    return res.status(200).json(ok({ message: "Password has been reset successfully." }));
  } catch (error) {
    return next(error);
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.cookie(ACCESS_TOKEN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
    res.cookie(REFRESH_TOKEN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
    res.cookie(CSRF_COOKIE, "", { ...COOKIE_OPTIONS, httpOnly: false, maxAge: 0 });
    return res.status(200).json(ok({ message: "Logged out" }));
  } catch (error) {
    return next(error);
  }
}
