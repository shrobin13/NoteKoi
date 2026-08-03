import { Router, type Router as ExpressRouter } from "express";
import { createCourseHandler, listCoursesHandler, updateCourseHandler } from "../controllers/course.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { createCourseSchema, departmentIdParamSchema, idParamSchema, updateCourseSchema } from "../validators/masterData.validator.js";

const router: ExpressRouter = Router();

router.get("/:departmentId/courses", authenticate, validate({ params: departmentIdParamSchema }), listCoursesHandler);
router.post("/", authenticate, authorize(["PLATFORM_ADMIN"]), validate({ body: createCourseSchema }), createCourseHandler);
router.patch("/:id", authenticate, authorize(["PLATFORM_ADMIN"]), validate({ params: idParamSchema, body: updateCourseSchema }), updateCourseHandler);

export default router;
