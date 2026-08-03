import { prisma } from "../prisma/prisma.js";
import { $Enums } from "../../generated/prisma/client.js";

export async function findContentGaps(limit = 10) {
  const groups = await prisma.resource.groupBy({
    by: ["courseId"],
    where: { state: $Enums.ResourceState.APPROVED },
    _count: { id: true },
    orderBy: { _count: { id: "asc" } },
    take: limit,
  });

  const courseIds = groups.map((item) => item.courseId);
  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true, name: true, departmentId: true },
  });

  const courseMap = new Map(courses.map((course) => [course.id, course]));

  return groups.map((group) => ({
    courseId: group.courseId,
    courseName: courseMap.get(group.courseId)?.name ?? "Unknown",
    departmentId: courseMap.get(group.courseId)?.departmentId ?? null,
    approvedResourceCount: group._count.id,
  }));
}

export async function findDedupSavings() {
  const totalResources = await prisma.resource.count();
  const hashedResources = await prisma.resource.groupBy({
    by: ["contentHash"],
    where: { contentHash: { not: null } },
    _count: { id: true },
  });

  const uniqueHashes = hashedResources.length;
  const duplicateRecords = Math.max(totalResources - uniqueHashes, 0);

  return {
    totalResources,
    uniqueContentHashes: uniqueHashes,
    duplicateRecords,
    dedupSavings: duplicateRecords,
  };
}

export async function findPromotionCountsByCollege() {
  const events = await prisma.promotionEvent.findMany({
    where: { action: $Enums.PromotionEventAction.PROMOTED },
    include: { resource: { select: { collegeId: true } } },
  });

  const counts = new Map<string, number>();
  for (const event of events) {
    const collegeId = event.resource.collegeId ?? "platform";
    counts.set(collegeId, (counts.get(collegeId) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([collegeId, count]) => ({ collegeId, promotionCount: count }));
}

export async function findCrThroughput(userId: string) {
  const resources = await prisma.resource.findMany({
    where: { moderatorId: userId, state: $Enums.ResourceState.APPROVED },
    select: { id: true, title: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    totalApprovedResources: resources.length,
    items: resources,
  };
}
