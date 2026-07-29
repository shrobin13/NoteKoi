// ── Shared TypeScript Types ────────────────────────────────────────────────

// ── Enums / Literals ──────────────────────────────────────────────────────
export type Role = "STUDENT" | "CR" | "SUB_ADMIN" | "OWNER_ADMIN";
export type UserStatus = "UNVERIFIED" | "VERIFIED" | "SUSPENDED";
export type CrSeat = "PRIMARY" | "SECONDARY";
export type Visibility = "PUBLIC" | "PRIVATE";
export type ResourceCategory = "Lecture" | "Notes" | "PYQ" | "Tutorial" | "Software" | "Other";
export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

// ── User ──────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  collegeId?: string;
  classroomUnitId?: string;
  crSeat?: CrSeat;
  createdAt?: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ── Hierarchy ─────────────────────────────────────────────────────────────
export interface College {
  id: string;
  name: string;
  createdAt?: string;
}

export interface Department {
  id: string;
  name: string;
  collegeId: string;
  college?: College;
  createdAt?: string;
}

export interface Semester {
  id: string;
  name: string;
  departmentId: string;
  department?: Department;
  createdAt?: string;
}

export interface Course {
  id: string;
  name: string;
  semesterId: string;
  semester?: Semester;
  createdAt?: string;
}

export interface Session {
  id: string;
  name: string;
  courseId: string;
  course?: Course;
  createdAt?: string;
}

export interface ClassroomUnit {
  id: string;
  departmentId: string;
  sessionId: string;
  department?: Department;
  session?: Session;
  createdAt?: string;
}

// ── Resources ─────────────────────────────────────────────────────────────
export interface Resource {
  id: string;
  title: string;
  category: ResourceCategory;
  visibility: Visibility;
  fileId: string;
  fileUrl: string;
  previewUrl?: string;
  courseId?: string;
  classroomUnitId: string;
  course?: Course;
  classroomUnit?: ClassroomUnit;
  createdAt?: string;
  updatedAt?: string;
}

// ── Verification ──────────────────────────────────────────────────────────
export interface VerificationRequest {
  id: string;
  userId: string;
  classroomUnitId: string;
  status: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  user?: { id: string; name: string; email: string };
  classroomUnit?: { id: string; department?: { name: string } };
}

// ── CR ────────────────────────────────────────────────────────────────────
export interface CRMember {
  id: string;
  name: string;
  email: string;
  crSeat: CrSeat;
  classroomUnitId: string;
}

// ── Admin Stats ───────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  totalColleges: number;
  totalDepartments: number;
  totalClassroomUnits: number;
  totalResources: number;
  pendingVerifications: number;
}

// ── Pagination ────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ── API Response Envelope ─────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
