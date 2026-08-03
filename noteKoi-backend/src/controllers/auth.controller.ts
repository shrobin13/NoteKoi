import type { Request, Response, NextFunction } from "express";
import { login, refreshSession, forgotPassword, resetPassword } from "../services/auth.service.js";
import { ok } from "../helpers/response.js";
import { clearAuthCookies, setAuthCookies, setCsrfCookie } from "../auth/cookies.js";


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
    const refreshToken = req.cookies?.["refresh_token"];
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
    clearAuthCookies(res);
    return res.status(200).json(ok({ message: "Logged out" }));
  } catch (error) {
    return next(error);
  }
}
