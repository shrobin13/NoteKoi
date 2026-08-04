import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../prisma/prisma.js";
import { $Enums } from "../../generated/prisma/client.js";

export function createResource(data: Prisma.ResourceCreateInput) {
  return prisma.resource.create({ data });
}

export function findCourseById(courseId: string) {
  return prisma.course.findUnique({ where: { id: courseId } });
}

export async function findResourcesByUploader(uploaderId: string, skip = 0, take = 20) {
  const items = await prisma.resource.findMany({
    where: { uploaderId },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: {
      uploader: { select: { id: true, email: true, name: true, role: true } },
      deletionRequests: { orderBy: { requestedAt: 'desc' }, take: 1 },
      promotionRecommendations: { orderBy: { recommendedAt: 'desc' }, take: 1 },
      promotionEvents: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  const total = await prisma.resource.count({ where: { uploaderId } });

  return { items, total };
}

export function findResourceById(id: string) {
  return prisma.resource.findUnique({
    where: { id },
    include: {
      uploader: { select: { id: true, email: true, name: true, role: true, collegeId: true, departmentId: true, sessionId: true } },
      deletionRequests: { orderBy: { requestedAt: 'desc' }, take: 1 },
      promotionRecommendations: { orderBy: { recommendedAt: 'desc' }, take: 1 },
      promotionEvents: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
}

export async function findResourcesByFilters(where: Record<string, unknown>, skip = 0, take = 20) {
  const items = await prisma.resource.findMany({
    where: where as Prisma.ResourceWhereInput,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: {
      college: { select: { id: true, name: true } },
      uploader: { select: { id: true, email: true, name: true, role: true } },
      deletionRequests: { orderBy: { requestedAt: 'desc' }, take: 1 },
    },
  });

  const total = await prisma.resource.count({ where: where as Prisma.ResourceWhereInput });

  return { items, total };
}

export function updateResourceMetadata(id: string, data: { title?: string; description?: string | null; tags?: string[] }) {
  return prisma.resource.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description ?? null,
      tags: data.tags ?? undefined,
    },
  });
}

export function updateResourceVisibility(id: string, visibility: Prisma.ResourceUpdateInput["visibility"]) {
  return prisma.resource.update({
    where: { id },
    data: { visibility },
  });
}

export async function reassignResourceWithInvalidation(resourceId: string, courseId: string, departmentId: string, sessionId?: string | null, invalidationReason?: string) {
  return prisma.$transaction(async (tx) => {
    // Invalidate any pending promotion recommendations for this resource
    await tx.promotionRecommendation.updateMany({
      where: { resourceId, status: "PENDING" },
      data: {
        status: $Enums.PromotionRecommendationStatus.INVALIDATED,
        invalidatedAt: new Date(),
        invalidationReason: invalidationReason ?? "structural_edit",
      },
    });

    const updated = await tx.resource.update({
      where: { id: resourceId },
      data: {
        course: { connect: { id: courseId } },
        department: { connect: { id: departmentId } },
        session: sessionId ? { connect: { id: sessionId } } : undefined,
        state: $Enums.ResourceState.PENDING,
      },
    });

    return updated;
  });
}

export async function findLatestVersion(rootId: string) {
  return prisma.resource.findFirst({
    where: { OR: [{ id: rootId }, { rootResourceId: rootId }] },
    orderBy: { versionNumber: 'desc' },
  });
}

export async function findResourceVersions(rootId: string) {
  return prisma.resource.findMany({
    where: { OR: [{ id: rootId }, { rootResourceId: rootId }] },
    orderBy: { versionNumber: 'asc' },
    include: {
      uploader: { select: { id: true, email: true, role: true } },
    },
  });
}

export async function createResourceVersion(data: {
  rootResourceId: string;
  uploaderId: string;
  uploaderRoleSnapshot: Prisma.ResourceCreateInput['uploaderRoleSnapshot'];
  resourceType: Prisma.ResourceCreateInput['resourceType'];
  title: string;
  description?: string | null;
  tags?: string[];
  courseId: string;
  departmentId: string;
  sessionId?: string | null;
  visibility: Prisma.ResourceCreateInput['visibility'];
  collegeId?: string | null;
  fileUrl?: string | null;
  youtubeUrl?: string | null;
  contentHash?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const max = await tx.resource.aggregate({
      where: { OR: [{ id: data.rootResourceId }, { rootResourceId: data.rootResourceId }] },
      _max: { versionNumber: true },
    });

    const nextVersion = (max._max.versionNumber ?? 1) + 1;

    const created = await tx.resource.create({
      data: {
        rootResource: { connect: { id: data.rootResourceId } },
        versionNumber: nextVersion,
        uploader: { connect: { id: data.uploaderId } },
        uploaderRoleSnapshot: data.uploaderRoleSnapshot,
        resourceType: data.resourceType,
        title: data.title,
        description: data.description ?? null,
        tags: data.tags ?? [],
        course: { connect: { id: data.courseId } },
        department: { connect: { id: data.departmentId } },
        session: data.sessionId ? { connect: { id: data.sessionId } } : undefined,
        visibility: data.visibility,
        college: data.collegeId ? { connect: { id: data.collegeId } } : undefined,
        fileUrl: data.fileUrl ?? null,
        youtubeUrl: data.youtubeUrl ?? null,
        contentHash: data.contentHash ?? null,
        state: 'PENDING',
      },
    });

    return created;
  });
}

export function updateResourceStateWithModerator(id: string, data: { state: Prisma.ResourceUpdateInput['state']; moderatorId?: string | null; moderatorReason?: string | null }) {
  return prisma.resource.update({
    where: { id },
    data: {
      state: data.state,
      moderatorId: data.moderatorId ?? undefined,
      moderatorReason: data.moderatorReason ?? undefined,
      moderatorDecisionAt: data.state === $Enums.ResourceState.IN_REVIEW ? undefined : new Date(),
    },
  });
}

export async function createDeletionRequestAndSetState(resourceId: string, requestedById: string) {
  return prisma.$transaction(async (tx) => {
    const dr = await tx.deletionRequest.create({
      data: {
        resource: { connect: { id: resourceId } },
        requestedBy: { connect: { id: requestedById } },
      },
    });

    await tx.resource.update({
      where: { id: resourceId },
      data: { state: $Enums.ResourceState.DELETION_REQUESTED, deletionRequestedAt: new Date() },
    });

    return dr;
  });
}

export async function decideDeletionRequest(requestId: string, decidedById: string, approve: boolean, decisionReason?: string) {
  return prisma.$transaction(async (tx) => {
    const req = await tx.deletionRequest.update({
      where: { id: requestId },
      data: {
        status: approve ? $Enums.DeletionRequestStatus.APPROVED : $Enums.DeletionRequestStatus.DENIED,
        decidedBy: { connect: { id: decidedById } },
        decidedAt: new Date(),
        decisionReason: decisionReason ?? null,
      },
    });

    const newState = approve ? $Enums.ResourceState.DELETED : $Enums.ResourceState.APPROVED;

    await tx.resource.update({
      where: { id: req.resourceId },
      data: {
        state: newState,
        deletionFlag: !approve ? false : undefined,
        moderatorId: decidedById,
        moderatorDecisionAt: new Date(),
        moderatorReason: decisionReason ?? null,
      },
    });

    return req;
  });
}

export async function createReportAndSetInReview(resourceId: string, reportedById: string, reason: string, note?: string | null) {
  return prisma.$transaction(async (tx) => {
    const report = await tx.report.create({
      data: {
        resource: { connect: { id: resourceId } },
        reportedBy: { connect: { id: reportedById } },
        reason: reason as Prisma.ReportCreateInput["reason"],
        note: note ?? null,
      },
    });

    // Invalidate any pending promotion recommendations for this resource
    await tx.promotionRecommendation.updateMany({
      where: { resourceId, status: "PENDING" },
      data: {
        status: $Enums.PromotionRecommendationStatus.INVALIDATED,
        invalidatedAt: new Date(),
        invalidationReason: "report_filed",
      },
    });

    await tx.resource.update({
      where: { id: resourceId },
      data: { state: $Enums.ResourceState.IN_REVIEW },
    });

    return report;
  });
}

export async function approveResourceAndSupersede(resourceId: string, moderatorId: string, reason?: string) {
  return prisma.$transaction(async (tx) => {
    const resource = await tx.resource.findUnique({ where: { id: resourceId } });
    if (!resource) throw new Error("Resource not found");

    // Approve the resource
    const updated = await tx.resource.update({
      where: { id: resourceId },
      data: {
        state: $Enums.ResourceState.APPROVED,
        moderatorId,
        moderatorDecisionAt: new Date(),
        moderatorReason: reason ?? null,
      },
    });

    // If this is a later version, supersede any prior approved version(s)
    if (resource.rootResourceId) {
      await tx.resource.updateMany({
        where: { rootResourceId: resource.rootResourceId, id: { not: resourceId }, state: $Enums.ResourceState.APPROVED },
        data: { state: $Enums.ResourceState.SUPERSEDED },
      });
    }

    return updated;
  });
}

export function rejectResource(resourceId: string, moderatorId: string, reason: string) {
  return prisma.resource.update({
    where: { id: resourceId },
    data: {
      state: $Enums.ResourceState.REJECTED,
      moderatorId,
      moderatorDecisionAt: new Date(),
      moderatorReason: reason,
    },
  });
}

export function openResourceForReview(resourceId: string, moderatorId: string) {
  return prisma.resource.update({
    where: { id: resourceId },
    data: {
      state: $Enums.ResourceState.IN_REVIEW,
      moderatorId,
      moderatorDecisionAt: undefined,
      moderatorReason: undefined,
    },
  });
}

export function markResourceDeletedByUploader(resourceId: string) {
  return prisma.resource.update({
    where: { id: resourceId },
    data: { state: $Enums.ResourceState.DELETED },
  });
}

export function setDeletionFlag(resourceId: string, flag = true) {
  return prisma.resource.update({
    where: { id: resourceId },
    data: { deletionFlag: flag, deletionRequestedAt: flag ? new Date() : undefined },
  });
}

export function resubmitResource(resourceId: string) {
  return prisma.resource.update({
    where: { id: resourceId },
    data: { state: $Enums.ResourceState.PENDING },
  });
}
