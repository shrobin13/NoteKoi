import { AppError } from "../errors/app.error.js";
import { createResource, findCourseById } from "../repositories/resource.repository.js";
import { findUserById, findTeacherDepartmentIds } from "../repositories/user.repository.js";
import { findActiveSubAdminAssignmentByUser } from "../repositories/subAdminAssignment.repository.js";
import { $Enums, type Resource, type DeletionRequest } from "../../generated/prisma/client.js";
import { findResourcesByUploader } from "../repositories/resource.repository.js";

function mapResourceToDto(resource: Resource & { deletionRequests?: DeletionRequest[] }) {
  // Derived display label per backend-workprocess.md Section 3.9
  let displayStatus = resource.state;

  if (resource.state === $Enums.ResourceState.IN_REVIEW && resource.deletionFlag) {
    displayStatus = "IN_REVIEW_DELETION_FLAGGED";
  } else if (resource.state === $Enums.ResourceState.DELETION_REQUESTED) {
    displayStatus = "DELETION_REQUESTED";
  } else if (resource.state === $Enums.ResourceState.DELETED) {
    displayStatus = "DELETED";
  } else if (resource.state === $Enums.ResourceState.SUPERSEDED) {
    displayStatus = "SUPERSEDED";
  } else if (resource.deletionRequests && resource.deletionRequests.length && resource.deletionRequests[0].status === $Enums.DeletionRequestStatus.DENIED) {
    displayStatus = "DELETION_DENIED";
  }

  return {
    id: resource.id,
    title: resource.title,
    resourceType: resource.resourceType,
    visibility: resource.visibility,
    state: resource.state,
    displayStatus,
    deletionFlag: resource.deletionFlag,
    fileUrl: resource.fileUrl,
    youtubeUrl: resource.youtubeUrl,
    courseId: resource.courseId,
    departmentId: resource.departmentId,
    sessionId: resource.sessionId,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
  };
}

export async function createResourceRecord(input: {
  uploaderId: string;
  uploaderRoleSnapshot: $Enums.Role;
  resourceType: $Enums.ResourceType;
  title: string;
  description?: string | null;
  tags: string[];
  courseId: string;
  departmentId: string;
  sessionId?: string | null;
  visibility: $Enums.Visibility;
  collegeId?: string | null;
  fileUrl?: string | null;
  youtubeUrl?: string | null;
  contentHash?: string | null;
}) {
  const uploader = await findUserById(input.uploaderId);
  if (!uploader) {
    throw new AppError("Uploader not found", 401, "UNAUTHENTICATED");
  }

  const course = await findCourseById(input.courseId);
  if (!course) {
    throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
  }

  if (course.departmentId !== input.departmentId) {
    throw new AppError("Course does not belong to the provided department", 422, "DEPARTMENT_MISMATCH");
  }

  if (input.resourceType === $Enums.ResourceType.PYQ && !input.sessionId) {
    throw new AppError("sessionId is required for PYQ resources", 422, "SESSION_REQUIRED_FOR_PYQ");
  }

  // Enforce uploader-specific rules from backend-workprocess.md
  let finalVisibility = input.visibility;
  let finalCollegeId = input.collegeId ?? null;

  if (uploader.role === $Enums.Role.STUDENT) {
    if (!uploader.isVerified) {
      throw new AppError("Student must be verified before uploading", 403, "VERIFICATION_REQUIRED");
    }

    // Students must upload only within their own college/department/session and visibility=COLLEGE
    finalVisibility = $Enums.Visibility.COLLEGE;
    finalCollegeId = uploader.collegeId ?? null;

    if (uploader.departmentId !== input.departmentId) {
      throw new AppError("Student may only upload to their own department", 403, "DEPARTMENT_MISMATCH");
    }

    if (input.resourceType === $Enums.ResourceType.PYQ && uploader.sessionId !== input.sessionId) {
      throw new AppError("Student may only upload PYQ for their own session", 403, "SESSION_MISMATCH");
    }
  }

  if (uploader.role === $Enums.Role.TEACHER) {
    if (uploader.teacherVerificationStatus !== $Enums.TeacherVerificationStatus.VERIFIED) {
      throw new AppError("Teacher must be verified to upload", 403, "VERIFICATION_REQUIRED");
    }

    // Teacher must be assigned to the department of the course
    const assigned = await findTeacherDepartmentIds(uploader.id);
    const assignedDeptIds = assigned.map((r) => r.departmentId);
    if (!assignedDeptIds.includes(course.departmentId)) {
      throw new AppError("Teacher not assigned to this department", 403, "DEPARTMENT_MISMATCH");
    }

    // Force college association for teacher uploads
    finalCollegeId = uploader.collegeId ?? null;
  }

  if (uploader.role === $Enums.Role.SUB_ADMIN) {
    const assignment = await findActiveSubAdminAssignmentByUser(uploader.id);
    if (!assignment) {
      throw new AppError("Active Sub Admin assignment required", 403, "FORBIDDEN");
    }

    finalCollegeId = assignment.collegeId;
    // Sub Admin uploading PLATFORM-level resources are allowed to create directly Approved (handled below)
  }

  if (uploader.role === $Enums.Role.PLATFORM_ADMIN) {
    // Platform admin uploads are platform-wide by default
    finalCollegeId = null;
  }

  if (input.resourceType === $Enums.ResourceType.VIDEO) {
    if (!input.youtubeUrl && !input.fileUrl) {
      throw new AppError("Video resources require either fileUrl or youtubeUrl", 422, "VIDEO_URL_REQUIRED");
    }
    if (input.youtubeUrl && input.fileUrl) {
      throw new AppError("Video resources must include only one of fileUrl or youtubeUrl", 422, "VIDEO_URL_CONFLICT");
    }
  } else {
    if (!input.fileUrl) {
      throw new AppError("Non-video resources require a fileUrl", 422, "FILE_URL_REQUIRED");
    }
    if (input.youtubeUrl) {
      throw new AppError("Only video resources may include youtubeUrl", 422, "YOUTUBE_URL_NOT_ALLOWED");
    }
  }
  // Determine initial state: PLATFORM_ADMIN always APPROVED; SUB_ADMIN creating PLATFORM resource -> APPROVED
  const state =
    uploader.role === $Enums.Role.PLATFORM_ADMIN
      ? $Enums.ResourceState.APPROVED
      : uploader.role === $Enums.Role.SUB_ADMIN && finalVisibility === $Enums.Visibility.PLATFORM
      ? $Enums.ResourceState.APPROVED
      : $Enums.ResourceState.PENDING;

  return createResource({
    uploader: { connect: { id: input.uploaderId } },
    uploaderRoleSnapshot: input.uploaderRoleSnapshot,
    resourceType: input.resourceType,
    title: input.title,
    description: input.description ?? null,
    tags: input.tags,
    course: { connect: { id: input.courseId } },
    department: { connect: { id: input.departmentId } },
    session: input.sessionId ? { connect: { id: input.sessionId } } : undefined,
    visibility: finalVisibility,
    college: finalCollegeId ? { connect: { id: finalCollegeId } } : undefined,
    fileUrl: input.fileUrl ?? null,
    youtubeUrl: input.youtubeUrl ?? null,
    contentHash: input.contentHash ?? null,
    state,
  });
}

export async function listMyUploads(actor: { userId?: string }, page = 1, limit = 20) {
  if (!actor.userId) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const skip = (page - 1) * limit;
  const { items, total } = await findResourcesByUploader(actor.userId, skip, limit);

  const data = items.map(mapResourceToDto);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getResourceById(actor: { userId?: string; role?: string; collegeId?: string | null; departmentId?: string | null; sessionId?: string | null } | null, id: string, includeOtherColleges = false) {
  const resource = await (await import("../repositories/resource.repository.js")).findResourceById(id);
  if (!resource) {
    throw new AppError("Resource not found", 404, "NOT_FOUND");
  }

  // Uploader may always view their own resource
  if (actor?.userId && actor.userId === resource.uploaderId) {
    return mapResourceToDto(resource as any);
  }

  // Platform Admin may view everything
  if (actor?.role === $Enums.Role.PLATFORM_ADMIN) {
    return mapResourceToDto(resource as any);
  }

  // If resource is not APPROVED, only uploader/moderator/platform-admin can view
  if (resource.state !== $Enums.ResourceState.APPROVED) {
    // Check Sub Admin scope
    if (actor?.role === $Enums.Role.SUB_ADMIN) {
      const assignment = await (await import("../repositories/subAdminAssignment.repository.js")).findActiveSubAdminAssignmentByUser(actor.userId ?? "");
      if (assignment && assignment.collegeId === resource.collegeId) {
        return mapResourceToDto(resource as any);
      }
    }

    // Check CR/Co-CR scope for Student-moderated resources
    if (actor?.role === $Enums.Role.STUDENT) {
      const assignment = await (await import("../repositories/crCoCrAssignment.repository.js")).findActiveCrCoCrAssignmentByScope(actor.userId ?? "", resource.departmentId, resource.sessionId ?? "");
      if (assignment) {
        return mapResourceToDto(resource as any);
      }
    }

    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  // Resource is APPROVED: apply visibility matrix from user-flow §0.3
  if (resource.visibility === $Enums.Visibility.PLATFORM) {
    return mapResourceToDto(resource as any);
  }

  // visibility = COLLEGE
  if (!actor) {
    throw new AppError("Authentication required to view college resources", 401, "UNAUTHENTICATED");
  }

  // Platform Admin already handled; Sub Admin may read all college resources (full for own college, read-only for others)
  if (actor.role === $Enums.Role.SUB_ADMIN) {
    return mapResourceToDto(resource as any);
  }

  // CR/Co-CR: full for own Dept+Session
  if (actor.role === $Enums.Role.STUDENT) {
    const crAssignment = await (await import("../repositories/crCoCrAssignment.repository.js")).findActiveCrCoCrAssignmentByScope(actor.userId ?? "", resource.departmentId, resource.sessionId ?? "");
    if (crAssignment) {
      return mapResourceToDto(resource as any);
    }
  }

  // Student/Teacher default view: own college allowed; other college only if includeOtherColleges true
  if ((actor.role === $Enums.Role.STUDENT || actor.role === $Enums.Role.TEACHER)) {
    if (actor.collegeId && resource.collegeId && actor.collegeId === resource.collegeId) {
      return mapResourceToDto(resource as any);
    }

    if (includeOtherColleges) {
      return mapResourceToDto(resource as any);
    }

    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  // Fallback: deny
  throw new AppError("Forbidden", 403, "FORBIDDEN");
}

export async function updateResourceMetadata(actor: { userId?: string }, id: string, payload: { title?: string; description?: string | null; tags?: string[] }) {
  if (!actor?.userId) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const resource = await (await import("../repositories/resource.repository.js")).findResourceById(id);
  if (!resource) {
    throw new AppError("Resource not found", 404, "NOT_FOUND");
  }

  if (resource.uploaderId !== actor.userId) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  // Only allow lightweight metadata edits; structural edits are separate
  const updated = await (await import("../repositories/resource.repository.js")).updateResourceMetadata(id, {
    title: payload.title,
    description: payload.description ?? null,
    tags: payload.tags,
  });

  return mapResourceToDto(updated as any);
}

export async function reassignResource(actor: { userId?: string; role?: string; collegeId?: string | null; departmentId?: string | null }, id: string, payload: { courseId: string; departmentId: string; sessionId?: string }) {
  if (!actor?.userId) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const resource = await (await import("../repositories/resource.repository.js")).findResourceById(id);
  if (!resource) {
    throw new AppError("Resource not found", 404, "NOT_FOUND");
  }

  if (resource.uploaderId !== actor.userId) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  // Validate course exists and belongs to the provided department
  const course = await (await import("../repositories/resource.repository.js")).findCourseById(payload.courseId);
  if (!course) {
    throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
  }

  if (course.departmentId !== payload.departmentId) {
    throw new AppError("Course does not belong to the provided department", 422, "DEPARTMENT_MISMATCH");
  }

  // Enforce uploader's allowed department scope
  const uploader = await (await import("../repositories/user.repository.js")).findUserById(actor.userId);
  if (!uploader) {
    throw new AppError("Uploader not found", 404, "USER_NOT_FOUND");
  }

  if (uploader.role === $Enums.Role.STUDENT) {
    if (uploader.departmentId !== payload.departmentId) {
      throw new AppError("Student may only reassign to a course within their own department", 403, "DEPARTMENT_MISMATCH");
    }
  }

  if (uploader.role === $Enums.Role.TEACHER) {
    const assigned = await (await import("../repositories/user.repository.js")).findTeacherDepartmentIds(uploader.id);
    const assignedIds = assigned.map((r) => r.departmentId);
    if (!assignedIds.includes(payload.departmentId)) {
      throw new AppError("Teacher not assigned to this department", 403, "DEPARTMENT_MISMATCH");
    }
  }

  // Perform transaction: update resource and invalidate pending promotion recommendations
  const updated = await (await import("../repositories/resource.repository.js")).reassignResourceWithInvalidation(id, payload.courseId, payload.departmentId, payload.sessionId ?? null, "structural_edit");

  return mapResourceToDto(updated as any);
}

export async function createResourceVersion(actor: { userId?: string; role?: string; collegeId?: string | null }, id: string, payload: { title?: string; description?: string | null; tags?: string[]; fileUrl?: string | null; youtubeUrl?: string | null; sessionId?: string }) {
  if (!actor?.userId) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  }

  const existing = await (await import("../repositories/resource.repository.js")).findResourceById(id);
  if (!existing) {
    throw new AppError("Resource not found", 404, "NOT_FOUND");
  }

  if (existing.uploaderId !== actor.userId) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  // Determine root id
  const rootId = existing.rootResourceId ?? existing.id;

  // Determine latest version to inherit visibility and course/department
  const latest = await (await import("../repositories/resource.repository.js")).findLatestVersion(rootId);
  const inheritVisibility = latest?.visibility ?? existing.visibility;
  const inheritCourseId = latest?.courseId ?? existing.courseId;
  const inheritDepartmentId = latest?.departmentId ?? existing.departmentId;
  const inheritSessionId = payload.sessionId ?? latest?.sessionId ?? existing.sessionId ?? null;

  // Enforce resourceType cannot change
  const resourceType = existing.resourceType;

  // Validation for video/file presence
  if (resourceType === $Enums.ResourceType.VIDEO) {
    if (!payload.youtubeUrl && !payload.fileUrl) {
      throw new AppError("Video resources require either fileUrl or youtubeUrl", 422, "VIDEO_URL_REQUIRED");
    }
    if (payload.youtubeUrl && payload.fileUrl) {
      throw new AppError("Video resources must include only one of fileUrl or youtubeUrl", 422, "VIDEO_URL_CONFLICT");
    }
  } else {
    if (!payload.fileUrl) {
      throw new AppError("Non-video resources require a fileUrl", 422, "FILE_URL_REQUIRED");
    }
  }

  // For PYQ ensure sessionId exists
  if (resourceType === $Enums.ResourceType.PYQ && !inheritSessionId) {
    throw new AppError("sessionId is required for PYQ resources", 422, "SESSION_REQUIRED_FOR_PYQ");
  }

  const created = await (await import("../repositories/resource.repository.js")).createResourceVersion({
    rootResourceId: rootId,
    uploaderId: actor.userId,
    uploaderRoleSnapshot: actor.role as any,
    resourceType: resourceType as any,
    title: payload.title ?? existing.title,
    description: payload.description ?? existing.description ?? null,
    tags: payload.tags ?? existing.tags ?? [],
    courseId: inheritCourseId,
    departmentId: inheritDepartmentId,
    sessionId: inheritSessionId ?? undefined,
    visibility: inheritVisibility as any,
    collegeId: existing.collegeId ?? undefined,
    fileUrl: payload.fileUrl ?? null,
    youtubeUrl: payload.youtubeUrl ?? null,
    contentHash: null,
  });

  return mapResourceToDto(created as any);
}
