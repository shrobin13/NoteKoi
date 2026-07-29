import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { validateWithDetails } from "../../middlewares/validate.js";
import { UpdateProfileSchema } from "./users.schema.js";
import * as ctrl from "./users.controller.js";

const router: Router = Router();

// All users routes require authentication
router.use(authenticate());

// GET /api/users/me
router.get("/me", ctrl.getMyProfile);

// PATCH /api/users/me
// R-050: Only own profile fields. Separate endpoint for status changes.
router.patch("/me", validateWithDetails(UpdateProfileSchema), ctrl.updateMyProfile);

// GET /api/users/:userId
router.get("/:userId", ctrl.getProfile);

export default router;
