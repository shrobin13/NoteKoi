import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { requireScope } from "../../middlewares/requireScope.js";
import { validateWithDetails } from "../../middlewares/validate.js";
import { Role } from "../../../generated/prisma/index.js";
import { CreateResourceSchema, UpdateResourceSchema, PublicResourceQuerySchema, PrivateResourceQuerySchema, } from "./resources.schema.js";
import * as ctrl from "./resources.controller.js";
const router = Router();
// GET /api/resources/public — Unauthenticated public resources search & browsing (R-032, R-033, R-039)
router.get("/public", validateWithDetails(PublicResourceQuerySchema, "query"), ctrl.getPublicResources);
// GET /api/resources/unit/:classroomUnitId — Unit-scoped resources (VERIFIED accounts only, R-037, INV-005)
router.get("/unit/:classroomUnitId", authenticate({ requireVerified: true }), requireScope("classroomUnit"), validateWithDetails(PrivateResourceQuerySchema, "query"), ctrl.getUnitResources);
// GET /api/resources/:id — View single resource (public or authenticated)
router.get("/:id", 
// Soft auth: attach req.user if token is provided, but don't fail if token missing
(req, res, next) => {
    if (req.headers.authorization) {
        return authenticate()(req, res, next);
    }
    next();
}, ctrl.getResourceById);
// POST /api/resources — Create resource (CR only, R-036)
router.post("/", authenticate({ requireVerified: true }), requireRole(Role.CR), requireScope("classroomUnit"), validateWithDetails(CreateResourceSchema), ctrl.createResource);
// PATCH /api/resources/:id — Update resource (CR only, R-036)
router.patch("/:id", authenticate({ requireVerified: true }), requireRole(Role.CR), validateWithDetails(UpdateResourceSchema), ctrl.updateResource);
// DELETE /api/resources/:id — Delete resource (CR only, R-036)
router.delete("/:id", authenticate({ requireVerified: true }), requireRole(Role.CR), ctrl.deleteResource);
export default router;
