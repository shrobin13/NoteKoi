import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import collegeRoutes from "./routes/college.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import courseRoutes from "./routes/course.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import roleRoutes from "./routes/role.routes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/colleges", collegeRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/departments", sessionRoutes);
app.use("/api/v1/departments", courseRoutes);
app.use("/api/v1", verificationRoutes);
app.use("/api/v1", roleRoutes);
app.use("/api/v1", healthRoutes);

app.use(errorHandler);

const port = env.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
