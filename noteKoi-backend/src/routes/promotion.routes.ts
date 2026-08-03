import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { resourceIdParamSchema } from "../validators/resource.validator.js";
import { promoteResourceHandler, recommendationApproveHandler, recommendationDenyHandler, recommendPromotionHandler, revokePromotionHandler } from "../controllers/promotion.controller.js";

const router: ExpressRouter = Router();

router.post("/resources/:id/recommend-promotion", authenticate, authorize(["STUDENT"]), validate({ params: resourceIdParamSchema }), recommendPromotionHandler);
router.post("/promotion-recommendations/:id/approve", authenticate, authorize(["SUB_ADMIN"]), validate({ params: resourceIdParamSchema }), recommendationApproveHandler);
router.post("/promotion-recommendations/:id/deny", authenticate, authorize(["SUB_ADMIN"]), validate({ params: resourceIdParamSchema }), recommendationDenyHandler);
router.post("/resources/:id/promote", authenticate, authorize(["SUB_ADMIN"]), validate({ params: resourceIdParamSchema }), promoteResourceHandler);
router.post("/resources/:id/revoke-promotion", authenticate, authorize(["SUB_ADMIN"]), validate({ params: resourceIdParamSchema }), revokePromotionHandler);

export default router;
