import { Router, type Router as ExpressRouter } from "express";
import { createDepartmentHandler, listDepartmentsHandler, updateDepartmentHandler } from "../controllers/department.controller.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { createDepartmentSchema, idParamSchema, updateDepartmentSchema } from "../validators/masterData.validator.js";

const router: ExpressRouter = Router();

router.get("/", listDepartmentsHandler);
router.post("/", authorize(["PLATFORM_ADMIN"]), validate({ body: createDepartmentSchema }), createDepartmentHandler);
router.patch("/:id", authorize(["PLATFORM_ADMIN"]), validate({ params: idParamSchema, body: updateDepartmentSchema }), updateDepartmentHandler);

export default router;
