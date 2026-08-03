import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { listNotificationsHandler, markNotificationReadHandler } from "../controllers/notification.controller.js";
import { validate } from "../middlewares/validate.js";
import { resourceIdParamSchema } from "../validators/resource.validator.js";

const router: ExpressRouter = Router();

router.get("/notifications", authenticate, listNotificationsHandler);
router.patch("/notifications/:id/read", authenticate, validate({ params: resourceIdParamSchema }), markNotificationReadHandler);

export default router;
