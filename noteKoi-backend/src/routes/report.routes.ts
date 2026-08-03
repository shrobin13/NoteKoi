import express from "express";
import { resolveReportHandler } from "../controllers/moderation.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { reportParams } from "../validators/moderation.validator.js";
import { requireActiveCrCoCrOrSubAdmin } from "../middlewares/scopeGuards.js";

const router: express.Router = express.Router();

router.post("/reports/:id/resolve", authenticate, validate({ params: reportParams }), requireActiveCrCoCrOrSubAdmin, resolveReportHandler);

export default router;
