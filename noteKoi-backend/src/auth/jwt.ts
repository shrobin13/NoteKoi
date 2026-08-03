import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type TokenPayload = {
  userId: string;
  role: string;
  collegeId?: string | null;
  departmentId?: string | null;
  sessionId?: string | null;
};

export type PasswordResetTokenPayload = TokenPayload & {
  type: "PASSWORD_RESET";
};

export function signAccessToken(payload: TokenPayload) {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRY as "1h" | "15m" | number };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(payload: TokenPayload) {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRY as "1h" | "15m" | number };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function signPasswordResetToken(payload: TokenPayload) {
  return jwt.sign({ ...payload, type: "PASSWORD_RESET" }, env.JWT_REFRESH_SECRET, {
    expiresIn: "1h",
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export function verifyPasswordResetToken(token: string) {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as PasswordResetTokenPayload;
  if (payload.type !== "PASSWORD_RESET") {
    throw new Error("Invalid password reset token");
  }
  return payload;
}
