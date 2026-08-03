import { Router, type Router as ExpressRouter } from "express";
import { getCurrentUserProfileHandler } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router: ExpressRouter = Router();

router.get("/me", authenticate, getCurrentUserProfileHandler);

export default router;
