import prisma from "../../lib/prisma.js";
import { ApiError } from "../../types/index.js";
import type { CreateShareDto, ShareQueryDto } from "./shares.schema.js";
import type { JwtPayload } from "../../middlewares/authenticate.js";

/** Get shares addressed to the calling user (or authored by calling user if CR) */
export async function getMyShares(query: ShareQueryDto, caller: JwtPayload) {
  const skip = (query.page - 1) * query.limit;

  // Search where user is a recipient OR where user is author (CR view)
  const where = {
    OR: [
      { recipients: { some: { recipientId: caller.sub } } },
      { authorId: caller.sub },
    ],
  };

  const [shares, total] = await Promise.all([
    prisma.personalShare.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
        recipients: {
          include: {
            recipient: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.personalShare.count({ where }),
  ]);

  return {
    data: shares,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/** Send personal share — CR only */
export async function createShare(dto: CreateShareDto, caller: JwtPayload) {
  if (caller.role !== "CR") {
    throw ApiError.forbidden("Only Class Representatives can send Personal/Confidential Shares");
  }
  if (caller.classroomUnitId !== dto.classroomUnitId) {
    throw ApiError.forbidden("You can only send shares within your own classroom unit");
  }

  const share = await prisma.personalShare.create({
    data: {
      content: dto.content,
      classroomUnitId: dto.classroomUnitId,
      authorId: caller.sub,
      recipients: {
        create: dto.recipientIds.map((recipientId) => ({ recipientId })),
      },
    },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } },
      recipients: {
        include: {
          recipient: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return share;
}
