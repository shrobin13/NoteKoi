import { AppError } from "../errors/app.error.js";
import { comparePassword, hashPassword } from "../auth/password.js";
import { createUser, findUserByEmail, findUserById, updateUserPassword } from "../repositories/user.repository.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken, verifyPasswordResetToken, signPasswordResetToken, type TokenPayload } from "../auth/jwt.js";
import { $Enums } from "../../generated/prisma/client.js";
import { sendMail } from "../mail/mail.js";
import { env } from "../config/env.js";

function buildUserDto(user: {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  collegeId?: string | null;
  departmentId?: string | null;
  sessionId?: string | null;
  isVerified: boolean;
  teacherVerificationStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email,
    role: user.role,
    collegeId: user.collegeId,
    departmentId: user.departmentId,
    sessionId: user.sessionId,
    isVerified: user.isVerified,
    teacherVerificationStatus: user.teacherVerificationStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError("Invalid email or password", 401, "AUTHENTICATION_FAILED");
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid email or password", 401, "AUTHENTICATION_FAILED");
  }

  const payload: TokenPayload = {
    userId: user.id,
    role: user.role,
    collegeId: user.collegeId ?? null,
    departmentId: user.departmentId ?? null,
    sessionId: user.sessionId ?? null,
  };

  return {
    user: buildUserDto(user),
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function refreshSession(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await findUserById(payload.userId);
    if (!user) {
      throw new AppError("Invalid refresh token", 401, "AUTHENTICATION_FAILED");
    }

    const newPayload: TokenPayload = {
      userId: user.id,
      role: user.role,
      collegeId: user.collegeId ?? null,
      departmentId: user.departmentId ?? null,
      sessionId: user.sessionId ?? null,
    };

    return {
      user: buildUserDto(user),
      accessToken: signAccessToken(newPayload),
      refreshToken: signRefreshToken(newPayload),
    };
  } catch {
    throw new AppError("Invalid refresh token", 401, "AUTHENTICATION_FAILED");
  }
}

export async function forgotPassword(email: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    return;
  }

  const payload: TokenPayload = {
    userId: user.id,
    role: user.role,
    collegeId: user.collegeId ?? null,
    departmentId: user.departmentId ?? null,
    sessionId: user.sessionId ?? null,
  };

  const resetToken = signPasswordResetToken(payload);
  const resetUrl = `${env.CORS_ORIGIN.replace(/\/+$/, "")}/reset-password?token=${encodeURIComponent(resetToken)}`;

  await sendMail(
    user.email,
    "Password Reset Request",
    `<p>You requested a password reset. Use the link below to reset your password:</p><p><a href="${resetUrl}">Reset your password</a></p><p>If you did not request this, please ignore this email.</p>`,
  );

  return;
}

export async function resetPassword(token: string, newPassword: string) {
  const payload = verifyPasswordResetToken(token);
  const passwordHash = await hashPassword(newPassword);
  await updateUserPassword(payload.userId, passwordHash);
}

export async function createInitialAdmin(email: string, password: string) {
  const existing = await findUserByEmail(email);
  if (existing) {
    return existing;
  }

  const passwordHash = await hashPassword(password);
  return createUser({
    email,
    passwordHash,
    role: $Enums.Role.PLATFORM_ADMIN,
    isVerified: true,
  });
}
