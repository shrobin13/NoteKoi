import { Router, type Router as ExpressRouter } from "express";
import {
  adoptDepartmentHandler,
  createCollegeHandler,
  listCollegeDepartmentsHandler,
  listCollegesHandler,
  revokeDepartmentHandler,
  updateCollegeHandler,
} from "../controllers/college.controller.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import {
  adoptDepartmentSchema,
  collegeDepartmentParamsSchema,
  collegeIdParamSchema,
  createCollegeSchema,
  idParamSchema,
  updateCollegeSchema,
} from "../validators/masterData.validator.js";

const router: ExpressRouter = Router();

router.get("/", listCollegesHandler);
router.post("/", authorize(["PLATFORM_ADMIN"]), validate({ body: createCollegeSchema }), createCollegeHandler);
router.patch("/:id", authorize(["PLATFORM_ADMIN"]), validate({ params: idParamSchema, body: updateCollegeSchema }), updateCollegeHandler);
router.get(
  "/:collegeId/departments",
  validate({ params: collegeIdParamSchema }),
  listCollegeDepartmentsHandler,
);
router.post(
  "/:collegeId/departments",
  authorize(["PLATFORM_ADMIN"]),
  validate({ params: collegeIdParamSchema, body: adoptDepartmentSchema }),
  adoptDepartmentHandler,
);
router.delete(
  "/:collegeId/departments/:departmentId",
  authorize(["PLATFORM_ADMIN"]),
  validate({ params: collegeDepartmentParamsSchema }),
  revokeDepartmentHandler,
);

export default router;
