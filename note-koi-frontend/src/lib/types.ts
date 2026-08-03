export type UserRole =
  | "GUEST"
  | "STUDENT"
  | "TEACHER"
  | "CR"
  | "CO_CR"
  | "SUB_ADMIN"
  | "PLATFORM_ADMIN";
export type UploaderRoleSnapshot = "STUDENT" | "TEACHER" | "SUB_ADMIN" | "PLATFORM_ADMIN";

export interface College {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface Department {
  id: string;
  name: string;
  collegeId?: string;
}

export interface Session {
  id: string;
  departmentId: string;
  label: string;
  isOpen: boolean;
}

export interface Course {
  id: string;
  departmentId: string;
  name: string;
  description?: string | null;
}

export type ResourceState =
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SUPERSEDED"
  | "DELETION_REQUESTED"
  | "DELETED";
export type Visibility = "COLLEGE" | "PLATFORM";
export type ResourceType =
  | "CLASS_NOTES"
  | "LECTURE_NOTES"
  | "SYLLABUS"
  | "VIDEO"
  | "PYQ"
  | "BOOK_PDF";

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  collegeId?: string;
  departmentId?: string;
  sessionId?: string;
  isVerified: boolean;
  teacherVerificationStatus?: "PENDING_VERIFICATION" | "APPROVED";
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  state: ResourceState;
  visibility: Visibility;
  deletionFlag?: boolean;
  version: number;
  contentHash: string;
  uploader: Pick<User, "id" | "name" | "role">;
  collegeId: string;
  courseId: string;
  tags?: string[];
  fileUrl?: string;
  youtubeUrl?: string;
  sessionId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body?: string | null;
  read: boolean;
  createdAt: string;
  meta?: Record<string, unknown> | null;
}
