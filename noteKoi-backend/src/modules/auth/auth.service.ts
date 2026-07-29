import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma.js";
import { env } from "../../config/index.js";
import { ApiError } from "../../types/index.js";
import { VerificationStatus, Role } from "../../../generated/prisma/index.js";
import type { RegisterDto, LoginDto } from "./auth.schema.js";
import type { JwtPayload } from "../../middlewares/authenticate.js";

// ─── Token helpers ─────────────────────────────────────────────────────────

function signAccessToken(payload: Omit<JwtPayload, "type">): string {
  return jwt.sign(
    { ...payload, type: "access" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions,
  );
}

function signRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: "refresh" },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions,
  );
}

function buildTokenPair(user: {
  id: string;
  role: Role;
  verificationStatus: VerificationStatus;
  collegeId: string;
  classroomUnitId: string | null;
}) {
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    verificationStatus: user.verificationStatus,
    collegeId: user.collegeId,
    classroomUnitId: user.classroomUnitId,
  });
  const refreshToken = signRefreshToken(user.id);
  return { accessToken, refreshToken };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function register(dto: RegisterDto) {
  // Check college exists
  const college = await prisma.college.findUnique({ where: { id: dto.collegeId } });
  if (!college) throw ApiError.badRequest("College not found", "COLLEGE_NOT_FOUND");

  // Check classroomUnit exists and belongs to this college
  const unit = await prisma.classroomUnit.findUnique({
    where: { id: dto.classroomUnitId },
    include: { department: { select: { collegeId: true } } },
  });
  if (!unit || unit.department.collegeId !== dto.collegeId) {
    throw ApiError.badRequest(
      "ClassroomUnit not found or does not belong to the selected college",
      "UNIT_MISMATCH",
    );
  }

  // Prevent duplicate email
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw ApiError.conflict("Email already registered");

  const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_SALT_ROUNDS);

  // Create user + verification request atomically
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: Role.STUDENT,
        verificationStatus: VerificationStatus.PENDING,
        collegeId: dto.collegeId,
        classroomUnitId: dto.classroomUnitId,
      },
    });

    // R-028: Student account starts PENDING, verification request created immediately
    await tx.verificationRequest.create({
      data: {
        userId: newUser.id,
        classroomUnitId: dto.classroomUnitId,
        status: VerificationStatus.PENDING,
      },
    });

    return newUser;
  });

  const tokens = buildTokenPair(user);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
      collegeId: user.collegeId,
      classroomUnitId: user.classroomUnitId,
    },
    ...tokens,
  };
}

export async function login(dto: LoginDto) {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  const tokens = buildTokenPair(user);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
      collegeId: user.collegeId,
      classroomUnitId: user.classroomUnitId,
    },
    ...tokens,
  };
}

export function refresh(token: string) {
  let payload: { sub: string; type: string };
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as typeof payload;
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  if (payload.type !== "refresh") {
    throw ApiError.unauthorized("Token type mismatch");
  }

  // Issue a new refresh token (rotation)
  const newRefreshToken = signRefreshToken(payload.sub);

  // We need the full user to rebuild the access token payload
  return { userId: payload.sub, newRefreshToken };
}

export async function refreshWithUser(token: string) {
  const { userId, newRefreshToken } = refresh(token);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.unauthorized("User not found");

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    verificationStatus: user.verificationStatus,
    collegeId: user.collegeId,
    classroomUnitId: user.classroomUnitId,
  });

  return { accessToken, refreshToken: newRefreshToken };
}
