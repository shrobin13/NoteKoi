import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { ok } from "../helpers/response.js";
import { getContentGaps, getCrThroughput, getDedupSavings, getPromotionCountsByCollege } from "../services/analytics.service.js";

const router: ExpressRouter = Router();

router.get("/analytics/content-gaps", authenticate, authorize(["SUB_ADMIN", "PLATFORM_ADMIN"]), async (_req, res, next) => {
  try {
    const result = await getContentGaps();
    return res.json(ok(result.items, result.meta));
  } catch (error) {
    return next(error);
  }
});

router.get("/analytics/dedup-savings", authenticate, authorize(["SUB_ADMIN", "PLATFORM_ADMIN"]), async (_req, res, next) => {
  try {
    const result = await getDedupSavings();
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
});

router.get("/platform-admin/analytics/promotions-by-college", authenticate, authorize(["PLATFORM_ADMIN"]), async (_req, res, next) => {
  try {
    const result = await getPromotionCountsByCollege();
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
});

router.get("/sub-admin/analytics/cr-throughput", authenticate, authorize(["SUB_ADMIN"]), async (req, res, next) => {
  try {
    const userId = (req as unknown as { user?: { userId?: string } }).user?.userId ?? "";
    const result = await getCrThroughput(userId);
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
});

router.get("/sub-admin/cr-audit", authenticate, authorize(["SUB_ADMIN"]), async (req, res, next) => {
  try {
    const userId = (req as unknown as { user?: { userId?: string } }).user?.userId ?? "";
    const result = await getCrThroughput(userId);
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
});

export default router;
