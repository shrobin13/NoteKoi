import express from "express";
import cors from "cors";
import helmet from "helmet";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Routers
import authRouter from "./modules/auth/auth.router.js";
import usersRouter from "./modules/users/users.router.js";
import hierarchyRouter from "./modules/hierarchy/hierarchy.router.js";
import adminRouter from "./modules/admin/admin.router.js";
import crRouter from "./modules/cr/cr.router.js";
import verificationRouter from "./modules/verification/verification.router.js";
import resourcesRouter from "./modules/resources/resources.router.js";

export function createApp(): express.Application {
  const app = express();

  // Security & standard middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global rate limiter
  app.use(generalLimiter);

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "noteKoi-backend",
    });
  });

  // API Route modules
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/hierarchy", hierarchyRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/cr", crRouter);
  app.use("/api/verification", verificationRouter);
  app.use("/api/resources", resourcesRouter);

  // 404 handler for unknown routes
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      code: "NOT_FOUND",
    });
  });

  // Global error handling middleware (must be registered last)
  app.use(errorHandler);

  return app;
}
