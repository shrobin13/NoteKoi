import { Router, type Router as ExpressRouter } from "express";
import { createCollegeHandler, listCollegesHandler, updateCollegeHandler } from "../controllers/college.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { createCollegeSchema, idParamSchema, updateCollegeSchema } from "../validators/masterData.validator.js";

const router: ExpressRouter = Router();

router.get("/", authenticate, listCollegesHandler);
router.post("/", authenticate, authorize(["PLATFORM_ADMIN"]), validate({ body: createCollegeSchema }), createCollegeHandler);
router.patch("/:id", authenticate, authorize(["PLATFORM_ADMIN"]), validate({ params: idParamSchema, body: updateCollegeSchema }), updateCollegeHandler);

export default router;
