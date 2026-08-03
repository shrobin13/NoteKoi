import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.preprocess((value) => Number(value), z.number().int().positive()).default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRY: z.string().min(1),
  JWT_REFRESH_EXPIRY: z.string().min(1),
  COOKIE_DOMAIN: z.string().min(1),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.preprocess((value) => Number(value), z.number().int().positive()),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  MAX_FILE_SIZE_MB: z.preprocess((value) => Number(value), z.number().int().positive()).default(20),
  ALLOWED_MIME_TYPES: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Environment validation failed", parsed.error.format());
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
export const allowedMimeTypes = env.ALLOWED_MIME_TYPES.split(",").map((mime) => mime.trim()).filter(Boolean);

export type Env = typeof env;
