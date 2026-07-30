// ── Shared TypeScript Types ────────────────────────────────────────────────

// ── Enums / Literals ──────────────────────────────────────────────────────
export type Role = "STUDENT" | "CR" | "SUB_ADMIN" | "OWNER_ADMIN";
/** @deprecated Use VerificationStatus instead */
export type UserStatus = "UNVERIFIED" | "VERIFIED" | "SUSPENDED";
export type CrSeat = "MAIN" | "CO";
export type Visibility = "PUBLIC" | "PRIVATE";
export type ResourceCategory = "Lecture" | "Notes" | "PYQ" | "Tutorial" | "Software" | "Other";
/** Matches the backend VerificationStatus enum: PENDING | VERIFIED | REJECTED */
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

// ── User ──────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Returned by the backend as verificationStatus (PENDING | VERIFIED | REJECTED) */
  verificationStatus: VerificationStatus;
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
  accessToken?: string;
  refreshToken?: string;
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
  classroomUnit?: { id: string; department?: { name: string }; session?: { name: string } };
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

// ── Notices ───────────────────────────────────────────────────────────────
export interface Notice {
  id: string;
  title: string;
  content: string;
  classroomUnitId: string;
  authorId: string;
  author?: { id: string; name: string; email: string; role: Role };
  createdAt: string;
  updatedAt?: string;
}

// ── Discussions ───────────────────────────────────────────────────────────
export interface DiscussionGroup {
  id: string;
  name: string;
  classroomUnitId: string;
  courseId?: string;
  createdById: string;
  course?: { id: string; name: string };
  createdBy?: { id: string; name: string };
  memberships?: Array<{ id: string; userId: string; user?: User }>;
  _count?: { messages: number; memberships: number };
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  groupId: string;
  senderId: string;
  sender?: { id: string; name: string; email: string; role: Role };
  createdAt: string;
}

// ── Personal Shares ───────────────────────────────────────────────────────
export interface PersonalShare {
  id: string;
  content: string;
  classroomUnitId: string;
  authorId: string;
  author?: { id: string; name: string; email: string; role: Role };
  recipients?: Array<{ id: string; recipientId: string; recipient?: User }>;
  createdAt: string;
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
