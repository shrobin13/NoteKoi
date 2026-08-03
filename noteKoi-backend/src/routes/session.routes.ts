import { Router, type Router as ExpressRouter } from "express";
import { createSessionHandler, listSessionsHandler, updateSessionHandler } from "../controllers/session.controller.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { createSessionSchema, departmentIdParamSchema, idParamSchema, updateSessionSchema } from "../validators/masterData.validator.js";

const router: ExpressRouter = Router();

router.get(
  "/departments/:departmentId/sessions",
  validate({ params: departmentIdParamSchema }),
  listSessionsHandler,
);
router.post(
  "/departments/:departmentId/sessions",
  authorize(["PLATFORM_ADMIN"]),
  validate({ params: departmentIdParamSchema, body: createSessionSchema }),
  createSessionHandler,
);
router.patch(
  "/sessions/:id",
  authorize(["PLATFORM_ADMIN"]),
  validate({ params: idParamSchema, body: updateSessionSchema }),
  updateSessionHandler,
);

export default router;
