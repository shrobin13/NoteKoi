import { Router } from "express";
import { authLimiter } from "../../middlewares/rateLimiter.js";
import { validateWithDetails } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { RegisterSchema, LoginSchema, RefreshSchema } from "./auth.schema.js";
import * as ctrl from "./auth.controller.js";
const router = Router();
// POST /api/auth/register
router.post("/register", authLimiter, validateWithDetails(RegisterSchema), ctrl.register);
// POST /api/auth/login
router.post("/login", authLimiter, validateWithDetails(LoginSchema), ctrl.login);
// POST /api/auth/refresh
router.post("/refresh", authLimiter, validateWithDetails(RefreshSchema), ctrl.refresh);
// POST /api/auth/logout
router.post("/logout", authenticate(), ctrl.logout);
export default router;
