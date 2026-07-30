import prisma from "../../lib/prisma.js";
import { ApiError } from "../../types/index.js";
import type { CreateNoticeDto, UpdateNoticeDto, NoticeQueryDto } from "./notices.schema.js";
import type { JwtPayload } from "../../middlewares/authenticate.js";

/** Get notices scoped to a classroom unit (verified members only) */
export async function getNotices(
  classroomUnitId: string,
  query: NoticeQueryDto,
  caller: JwtPayload,
) {
  // Scope check: user must belong to this unit OR be admin
  if (
    caller.role !== "OWNER_ADMIN" &&
    caller.role !== "SUB_ADMIN" &&
    caller.classroomUnitId !== classroomUnitId
  ) {
    throw ApiError.forbidden("You can only view notices for your own classroom unit");
  }

  const skip = (query.page - 1) * query.limit;
  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where: { classroomUnitId },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.notice.count({ where: { classroomUnitId } }),
  ]);

  return {
    data: notices,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/** Create a notice — CR only, for their own classroom unit */
export async function createNotice(dto: CreateNoticeDto, caller: JwtPayload) {
  if (caller.role !== "CR") {
    throw ApiError.forbidden("Only Class Representatives can create notices");
  }
  if (caller.classroomUnitId !== dto.classroomUnitId) {
    throw ApiError.forbidden("You can only post notices for your own classroom unit");
  }

  const notice = await prisma.notice.create({
    data: {
      title: dto.title,
      content: dto.content,
      classroomUnitId: dto.classroomUnitId,
      authorId: caller.sub,
    },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return notice;
}

/** Update a notice — authoring CR only */
export async function updateNotice(id: string, dto: UpdateNoticeDto, caller: JwtPayload) {
  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) throw ApiError.notFound("Notice not found");

  if (caller.role !== "CR" || notice.authorId !== caller.sub) {
    // Allow co-CR from same unit to edit too
    const isCoCR =
      caller.role === "CR" && caller.classroomUnitId === notice.classroomUnitId;
    if (!isCoCR) {
      throw ApiError.forbidden("Only a CR of this classroom unit can edit this notice");
    }
  }

  const updated = await prisma.notice.update({
    where: { id },
    data: dto,
    include: {
      author: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return updated;
}

/** Delete a notice — CR of the same unit */
export async function deleteNotice(id: string, caller: JwtPayload) {
  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) throw ApiError.notFound("Notice not found");

  if (caller.role !== "CR" || caller.classroomUnitId !== notice.classroomUnitId) {
    throw ApiError.forbidden("Only a CR of this classroom unit can delete this notice");
  }

  await prisma.notice.delete({ where: { id } });
}
