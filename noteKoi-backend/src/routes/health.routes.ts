import { Router } from "express";
import { ok } from "../helpers/response.js";

const router: Router = Router();

router.get("/health", (_req, res) => {
  res.json(ok({ status: "ok" }));
});

export default router;
