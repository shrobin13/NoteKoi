import prisma from "../../lib/prisma.js";
import { ApiError, paginate } from "../../types/index.js";
import { Visibility } from "../../../generated/prisma/index.js";
import type {
  CreateResourceDto,
  UpdateResourceDto,
  PublicResourceQueryDto,
  PrivateResourceQueryDto,
} from "./resources.schema.js";

// ─── Public Resource Browsing (No Auth) ──────────────────────────────────────

/**
 * R-032, R-033, R-039: Public academic resources list query.
 * Must filter `visibility = PUBLIC` at database query level.
 */
export async function getPublicResources(query: PublicResourceQueryDto) {
  const { skip, take } = paginate(query.page, query.limit);

  const where: any = {
    visibility: Visibility.PUBLIC,
  };

  if (query.category) {
    where.category = query.category;
  }

  if (query.courseId) {
    where.courseId = query.courseId;
  }

  if (query.departmentId) {
    where.classroomUnit = {
      departmentId: query.departmentId,
    };
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { category: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.resource.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        uploader: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } },
        classroomUnit: {
          select: {
            id: true,
            department: { select: { id: true, name: true } },
            session: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.resource.count({ where }),
  ]);

  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/**
 * Single resource fetch by ID.
 * Supports public access if visibility is PUBLIC; caller handles auth for PRIVATE.
 */
export async function getResourceById(id: string) {
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      uploader: { select: { id: true, name: true, role: true } },
      course: { select: { id: true, name: true } },
      classroomUnit: {
        select: {
          id: true,
          department: { select: { id: true, name: true, collegeId: true } },
          session: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!resource) throw ApiError.notFound("Resource not found");
  return resource;
}

// ─── Private / ClassroomUnit-Scoped Resources (Authenticated) ───────────────

/**
 * List resources within a ClassroomUnit (both PUBLIC and PRIVATE).
 * Must be verified member of unit or Sub/Owner Admin.
 */
export async function getUnitResources(
  classroomUnitId: string,
  query: PrivateResourceQueryDto,
) {
  const { skip, take } = paginate(query.page, query.limit);

  const where: any = {
    classroomUnitId,
  };

  if (query.category) {
    where.category = query.category;
  }

  if (query.courseId) {
    where.courseId = query.courseId;
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { category: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.resource.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        uploader: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } },
      },
    }),
    prisma.resource.count({ where }),
  ]);

  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

// ─── CR Resource Management (CRUD) ──────────────────────────────────────────

/**
 * R-036: CR creates a resource within their ClassroomUnit.
 */
export async function createResource(dto: CreateResourceDto, uploaderId: string) {
  // Check classroom unit existence
  const unit = await prisma.classroomUnit.findUnique({
    where: { id: dto.classroomUnitId },
  });
  if (!unit) throw ApiError.notFound("ClassroomUnit not found");

  if (dto.courseId) {
    const course = await prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) throw ApiError.notFound("Course not found");
  }

  return prisma.resource.create({
    data: {
      title: dto.title,
      category: dto.category,
      visibility: dto.visibility,
      fileId: dto.fileId,
      fileUrl: dto.fileUrl,
      previewUrl: dto.previewUrl,
      courseId: dto.courseId,
      classroomUnitId: dto.classroomUnitId,
      uploaderId,
    },
    include: {
      uploader: { select: { id: true, name: true } },
      course: { select: { id: true, name: true } },
    },
  });
}

/**
 * R-036: CR updates a resource within their ClassroomUnit.
 */
export async function updateResource(
  id: string,
  dto: UpdateResourceDto,
  classroomUnitId: string,
) {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw ApiError.notFound("Resource not found");

  if (resource.classroomUnitId !== classroomUnitId) {
    throw ApiError.forbidden("You can only edit resources in your own ClassroomUnit");
  }

  return prisma.resource.update({
    where: { id },
    data: { ...dto },
    include: {
      uploader: { select: { id: true, name: true } },
      course: { select: { id: true, name: true } },
    },
  });
}

/**
 * R-036: CR deletes a resource within their ClassroomUnit.
 */
export async function deleteResource(id: string, classroomUnitId: string) {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw ApiError.notFound("Resource not found");

  if (resource.classroomUnitId !== classroomUnitId) {
    throw ApiError.forbidden("You can only delete resources in your own ClassroomUnit");
  }

  return prisma.resource.delete({ where: { id } });
}
