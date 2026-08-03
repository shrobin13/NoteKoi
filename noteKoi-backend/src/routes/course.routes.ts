import { Router, type Router as ExpressRouter } from "express";
import { createCourseHandler, listCoursesHandler, updateCourseHandler } from "../controllers/course.controller.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { createCourseSchema, departmentIdParamSchema, idParamSchema, updateCourseSchema } from "../validators/masterData.validator.js";

const router: ExpressRouter = Router();

router.get(
  "/departments/:departmentId/courses",
  validate({ params: departmentIdParamSchema }),
  listCoursesHandler,
);
router.post(
  "/departments/:departmentId/courses",
  authorize(["PLATFORM_ADMIN"]),
  validate({ params: departmentIdParamSchema, body: createCourseSchema }),
  createCourseHandler,
);
router.patch(
  "/courses/:id",
  authorize(["PLATFORM_ADMIN"]),
  validate({ params: idParamSchema, body: updateCourseSchema }),
  updateCourseHandler,
);

export default router;
