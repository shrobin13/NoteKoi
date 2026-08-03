import express from "express";
import { createResourceHandler, createResourceUploadHandler, getMyUploadsHandler, getResourceHandler, listResourcesHandler, updateResourceMetadataHandler, getResourceVersionsHandler } from "../controllers/resource.controller.js";
import { reassignResourceHandler, createResourceVersionHandler } from "../controllers/resource.controller.js";
import { requireOwnership } from "../middlewares/scopeGuards.js";
import { findResourceById } from "../repositories/resource.repository.js";
import { validate } from "../middlewares/validate.js";
import { createResourceSchema, listResourcesQuerySchema, myUploadsQuerySchema, resourceIdParamSchema, viewResourceQuerySchema, resourceMetadataSchema, resourceReassignSchema, resourceVersionSchema } from "../validators/resource.validator.js";
import { authenticate } from "../middlewares/authenticate.js";
import { upload } from "../storage/multerConfig.js";

const router: express.Router = express.Router();

router.get("/resources", validate({ query: listResourcesQuerySchema }), listResourcesHandler);
router.get("/resources/search", validate({ query: listResourcesQuerySchema }), listResourcesHandler);
router.post("/resources", authenticate, validate({ body: createResourceSchema }), createResourceHandler);
// multipart upload endpoint: field `file` expected
router.post("/resources/upload", authenticate, upload.single("file"), createResourceUploadHandler);

// My uploads listing (paginated)
router.get("/resources/my-uploads", authenticate, validate({ query: myUploadsQuerySchema }), getMyUploadsHandler);
router.get("/resources/:id", validate({ params: resourceIdParamSchema, query: viewResourceQuerySchema }), getResourceHandler);
router.get("/resources/:id/versions", authenticate, validate({ params: resourceIdParamSchema }), getResourceVersionsHandler);
router.patch(
	"/resources/:id/metadata",
	authenticate,
	validate({ params: resourceIdParamSchema, body: resourceMetadataSchema }),
	requireOwnership((req) => findResourceById(typeof req.params.id === "string" ? req.params.id : "")),
	updateResourceMetadataHandler,
);

router.patch(
	"/resources/:id/reassign",
	authenticate,
	validate({ params: resourceIdParamSchema, body: resourceReassignSchema }),
	requireOwnership((req) => findResourceById(typeof req.params.id === "string" ? req.params.id : "")),
	reassignResourceHandler,
);

router.post(
	"/resources/:id/versions",
	authenticate,
	validate({ params: resourceIdParamSchema, body: resourceVersionSchema }),
	requireOwnership((req) => findResourceById(typeof req.params.id === "string" ? req.params.id : "")),
	createResourceVersionHandler,
);

export default router;
