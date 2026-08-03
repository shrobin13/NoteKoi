import { findContentGaps, findCrThroughput, findDedupSavings, findPromotionCountsByCollege } from "../repositories/analytics.repository.js";

export async function getContentGaps(limit = 10) {
  const items = await findContentGaps(limit);
  return { items, meta: { total: items.length } };
}

export async function getDedupSavings() {
  return await findDedupSavings();
}

export async function getPromotionCountsByCollege() {
  return await findPromotionCountsByCollege();
}

export async function getCrThroughput(userId: string) {
  return await findCrThroughput(userId);
}
