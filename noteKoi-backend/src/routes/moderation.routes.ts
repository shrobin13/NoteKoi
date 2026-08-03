import express from "express";
import {
  openReviewHandler,
  approveHandler,
  rejectHandler,
  selfCancelHandler,
  flagDeletionHandler,
  requestDeletionHandler,
  deletionDecisionHandler,
  reportHandler,
  resubmitHandler,
} from "../controllers/moderation.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { openReviewParams, approveBody, rejectBody, reportBody, deletionDecisionBody, deletionRequestParams, reportParams, resubmitParams } from "../validators/moderation.validator.js";
import { resourceIdParamSchema } from "../validators/resource.validator.js";
import { requireActiveCrCoCrOrSubAdmin, requireOwnership } from "../middlewares/scopeGuards.js";
import { findResourceById } from "../repositories/resource.repository.js";

const router: express.Router = express.Router();

router.post("/resources/:id/open-review", authenticate, validate({ params: openReviewParams }), requireActiveCrCoCrOrSubAdmin, openReviewHandler);

router.post("/resources/:id/approve", authenticate, validate({ params: openReviewParams, body: approveBody }), requireActiveCrCoCrOrSubAdmin, approveHandler);

router.post("/resources/:id/reject", authenticate, validate({ params: openReviewParams, body: rejectBody }), requireActiveCrCoCrOrSubAdmin, rejectHandler);

router.post("/resources/:id/self-cancel", authenticate, validate({ params: deletionRequestParams }), requireOwnership((req) => findResourceById(typeof req.params.id === "string" ? req.params.id : "")), selfCancelHandler);

router.post("/resources/:id/flag-deletion", authenticate, validate({ params: deletionRequestParams }), requireOwnership((req) => findResourceById(typeof req.params.id === "string" ? req.params.id : "")), flagDeletionHandler);

router.post("/resources/:id/request-deletion", authenticate, validate({ params: deletionRequestParams }), requireOwnership((req) => findResourceById(typeof req.params.id === "string" ? req.params.id : "")), requestDeletionHandler);

router.post("/deletion-requests/:id/decision", authenticate, validate({ params: resourceIdParamSchema, body: deletionDecisionBody }), requireActiveCrCoCrOrSubAdmin, deletionDecisionHandler as any);

router.post("/resources/:id/report", authenticate, validate({ params: reportParams, body: reportBody }), reportHandler);

router.post("/resources/:id/resubmit", authenticate, validate({ params: resubmitParams }), requireOwnership((req) => findResourceById(typeof req.params.id === "string" ? req.params.id : "")), resubmitHandler);

export default router;
