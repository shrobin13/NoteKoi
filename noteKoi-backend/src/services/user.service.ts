import { hashPassword } from "../auth/password.js";
import { AppError } from "../errors/app.error.js";
import { findCollegeById } from "../repositories/college.repository.js";
import { findCollegeDepartment } from "../repositories/collegeDepartment.repository.js";
import { findDepartmentById } from "../repositories/department.repository.js";
import { findSessionById } from "../repositories/session.repository.js";
import { createUser, createTeacherUserWithDepartments, findUserByCollegeAndRegNo, findUserByEmail, findUserById } from "../repositories/user.repository.js";
import { $Enums } from "../../generated/prisma/client.js";

function buildUserDto(user: {
  id: string;
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

export async function getCurrentUserProfile(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return buildUserDto(user);
}

export async function registerStudent(input: {
  email: string;
  password: string;
  collegeId: string;
  departmentId: string;
  sessionId: string;
  regNo: string;
}) {
  const existingEmail = await findUserByEmail(input.email);
  if (existingEmail) {
    throw new AppError("A user with this email already exists", 409, "EMAIL_ALREADY_EXISTS");
  }

  const existingRegNo = await findUserByCollegeAndRegNo(input.collegeId, input.regNo);
  if (existingRegNo) {
    throw new AppError("A student with this registration number already exists for this college", 409, "REG_NO_ALREADY_EXISTS");
  }

  const college = await findCollegeById(input.collegeId);
  if (!college) {
    throw new AppError("College not found", 404, "COLLEGE_NOT_FOUND");
  }

  const department = await findDepartmentById(input.departmentId);
  if (!department) {
    throw new AppError("Department not found", 404, "DEPARTMENT_NOT_FOUND");
  }

  const adoptedDepartment = await findCollegeDepartment(input.collegeId, input.departmentId);
  if (!adoptedDepartment) {
    throw new AppError("Selected department is not adopted by the college", 422, "DEPARTMENT_NOT_ADOPTED");
  }

  const session = await findSessionById(input.sessionId);
  if (!session || session.departmentId !== input.departmentId) {
    throw new AppError("Session not found for the selected department", 404, "SESSION_NOT_FOUND");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    email: input.email,
    passwordHash,
    role: $Enums.Role.STUDENT,
    college: {
      connect: { id: input.collegeId },
    },
    department: {
      connect: { id: input.departmentId },
    },
    session: {
      connect: { id: input.sessionId },
    },
    regNo: input.regNo,
    isVerified: false,
  });

  return buildUserDto(user);
}

export async function registerTeacher(input: {
  email: string;
  password: string;
  collegeId: string;
  departmentIds: string[];
}) {
  const existingEmail = await findUserByEmail(input.email);
  if (existingEmail) {
    throw new AppError("A user with this email already exists", 409, "EMAIL_ALREADY_EXISTS");
  }

  const college = await findCollegeById(input.collegeId);
  if (!college) {
    throw new AppError("College not found", 404, "COLLEGE_NOT_FOUND");
  }

  const departmentIds = [...new Set(input.departmentIds)];
  if (departmentIds.length === 0) {
    throw new AppError("At least one department is required", 422, "DEPARTMENTS_REQUIRED");
  }

  for (const departmentId of departmentIds) {
    const department = await findDepartmentById(departmentId);
    if (!department) {
      throw new AppError("Department not found", 404, "DEPARTMENT_NOT_FOUND");
    }

    const adoptedDepartment = await findCollegeDepartment(input.collegeId, departmentId);
    if (!adoptedDepartment) {
      throw new AppError("Selected department is not adopted by the college", 422, "DEPARTMENT_NOT_ADOPTED");
    }
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createTeacherUserWithDepartments(
    {
      email: input.email,
      passwordHash,
      role: $Enums.Role.TEACHER,
      college: {
        connect: { id: input.collegeId },
      },
      isVerified: false,
      teacherVerificationStatus: $Enums.TeacherVerificationStatus.PENDING_VERIFICATION,
    },
    departmentIds,
  );

  return buildUserDto(user);
}
