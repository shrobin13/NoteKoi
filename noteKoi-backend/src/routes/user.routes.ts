import { Router, type Router as ExpressRouter } from "express";
import { getCurrentUserProfileHandler, getCurrentUserAssignmentsHandler, updateUserProfileHandler } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router: ExpressRouter = Router();

router.get("/me", authenticate, getCurrentUserProfileHandler);
router.put("/me", authenticate, updateUserProfileHandler);
router.get("/me/assignments", authenticate, getCurrentUserAssignmentsHandler);

export default router;
