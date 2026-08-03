import { Router, type Router as ExpressRouter } from "express";
import { createSessionHandler, listSessionsHandler, updateSessionHandler } from "../controllers/session.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { createSessionSchema, departmentIdParamSchema, idParamSchema, updateSessionSchema } from "../validators/masterData.validator.js";

const router: ExpressRouter = Router();

router.get("/:departmentId/sessions", authenticate, validate({ params: departmentIdParamSchema }), listSessionsHandler);
router.post("/", authenticate, authorize(["PLATFORM_ADMIN"]), validate({ body: createSessionSchema }), createSessionHandler);
router.patch("/:id", authenticate, authorize(["PLATFORM_ADMIN"]), validate({ params: idParamSchema, body: updateSessionSchema }), updateSessionHandler);

export default router;
