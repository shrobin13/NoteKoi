import prisma from "../../lib/prisma.js";
import { ApiError } from "../../types/index.js";
import type { CreateGroupDto, AddMemberDto, SendMessageDto, MessageQueryDto } from "./discussions.schema.js";
import type { JwtPayload } from "../../middlewares/authenticate.js";

/** Get groups for user's classroom unit or where user is member */
export async function getGroups(classroomUnitId: string, caller: JwtPayload) {
  if (
    caller.role !== "OWNER_ADMIN" &&
    caller.role !== "SUB_ADMIN" &&
    caller.classroomUnitId !== classroomUnitId
  ) {
    throw ApiError.forbidden("You can only view discussion groups for your own classroom unit");
  }

  const groups = await prisma.discussionGroup.findMany({
    where: { classroomUnitId },
    include: {
      course: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      memberships: {
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      _count: { select: { messages: true, memberships: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return groups;
}

/** Create a discussion group — CR only */
export async function createGroup(dto: CreateGroupDto, caller: JwtPayload) {
  if (caller.role !== "CR") {
    throw ApiError.forbidden("Only Class Representatives can create discussion groups");
  }
  if (caller.classroomUnitId !== dto.classroomUnitId) {
    throw ApiError.forbidden("You can only create groups for your own classroom unit");
  }

  if (dto.courseId) {
    const existing = await prisma.discussionGroup.findFirst({
      where: { courseId: dto.courseId },
    });
    if (existing) {
      throw ApiError.conflict("A discussion group already exists for this course");
    }
  }

  const group = await prisma.discussionGroup.create({
    data: {
      name: dto.name,
      classroomUnitId: dto.classroomUnitId,
      courseId: dto.courseId,
      createdById: caller.sub,
      memberships: {
        create: {
          userId: caller.sub,
          addedById: caller.sub,
        },
      },
    },
    include: {
      course: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { messages: true, memberships: true } },
    },
  });

  return group;
}

/** Add member to group — CR only */
export async function addMember(groupId: string, dto: AddMemberDto, caller: JwtPayload) {
  const group = await prisma.discussionGroup.findUnique({ where: { id: groupId } });
  if (!group) throw ApiError.notFound("Discussion group not found");

  if (caller.role !== "CR" || caller.classroomUnitId !== group.classroomUnitId) {
    throw ApiError.forbidden("Only a CR of this classroom unit can add members");
  }

  const existing = await prisma.discussionMembership.findUnique({
    where: { groupId_userId: { groupId, userId: dto.userId } },
  });
  if (existing) throw ApiError.conflict("User is already a member of this group");

  const membership = await prisma.discussionMembership.create({
    data: {
      groupId,
      userId: dto.userId,
      addedById: caller.sub,
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return membership;
}

/** Remove member from group — CR only */
export async function removeMember(groupId: string, userId: string, caller: JwtPayload) {
  const group = await prisma.discussionGroup.findUnique({ where: { id: groupId } });
  if (!group) throw ApiError.notFound("Discussion group not found");

  if (caller.role !== "CR" || caller.classroomUnitId !== group.classroomUnitId) {
    throw ApiError.forbidden("Only a CR of this classroom unit can remove members");
  }

  await prisma.discussionMembership.delete({
    where: { groupId_userId: { groupId, userId } },
  });
}

/** Get messages in group */
export async function getMessages(groupId: string, query: MessageQueryDto, caller: JwtPayload) {
  const group = await prisma.discussionGroup.findUnique({ where: { id: groupId } });
  if (!group) throw ApiError.notFound("Discussion group not found");

  if (
    caller.role !== "OWNER_ADMIN" &&
    caller.role !== "SUB_ADMIN" &&
    caller.classroomUnitId !== group.classroomUnitId
  ) {
    throw ApiError.forbidden("You can only view messages for groups in your classroom unit");
  }

  const skip = (query.page - 1) * query.limit;
  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { groupId },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
      skip,
      take: query.limit,
    }),
    prisma.message.count({ where: { groupId } }),
  ]);

  return {
    data: messages,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/** Send message in group */
export async function sendMessage(groupId: string, dto: SendMessageDto, caller: JwtPayload) {
  const group = await prisma.discussionGroup.findUnique({ where: { id: groupId } });
  if (!group) throw ApiError.notFound("Discussion group not found");

  if (caller.classroomUnitId !== group.classroomUnitId) {
    throw ApiError.forbidden("You can only send messages in groups within your classroom unit");
  }

  const message = await prisma.message.create({
    data: {
      content: dto.content,
      groupId,
      senderId: caller.sub,
    },
    include: {
      sender: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return message;
}
