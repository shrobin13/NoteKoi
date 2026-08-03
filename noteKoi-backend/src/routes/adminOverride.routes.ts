import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { ok } from "../helpers/response.js";
import { prisma } from "../prisma/prisma.js";
import { validate } from "../middlewares/validate.js";
import { overridePromotionSchema } from "../validators/adminOverride.validator.js";
import { promotionOverrideHandler } from "../controllers/adminOverride.controller.js";
import { emergencyAppointmentSchema, resourceOverrideSchema } from "../validators/adminOverride.validator.js";
import { resourceIdParamSchema } from "../validators/resource.validator.js";
import { emergencyAppointmentHandler, resourceOverrideHandler } from "../controllers/adminOverride.controller.js";

const router: ExpressRouter = Router();

router.post("/platform-admin/promotion-override", authenticate, authorize(["PLATFORM_ADMIN"]), validate({ body: overridePromotionSchema }), promotionOverrideHandler);

router.post("/platform-admin/emergency-appointments", authenticate, authorize(["PLATFORM_ADMIN"]), validate({ body: emergencyAppointmentSchema }), emergencyAppointmentHandler);

router.post("/platform-admin/resources/:id/override", authenticate, authorize(["PLATFORM_ADMIN"]), validate({ params: resourceIdParamSchema, body: resourceOverrideSchema }), resourceOverrideHandler);

router.get("/platform-admin/analytics/override-logs", authenticate, authorize(["PLATFORM_ADMIN"]), async (_req, res, next) => {
  try {
    const logs = await prisma.adminOverrideLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.json(ok(logs));
  } catch (error) {
    return next(error);
  }
});

export default router;
