import { env } from "../config/index.js";

type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, message: string, meta?: unknown): void {
  if (level === "debug" && env.NODE_ENV === "production") return;

  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;

  if (meta !== undefined) {
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
      prefix,
      message,
      meta,
    );
  } else {
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
      prefix,
      message,
    );
  }
}

export const logger = {
  info: (msg: string, meta?: unknown) => log("info", msg, meta),
  warn: (msg: string, meta?: unknown) => log("warn", msg, meta),
  error: (msg: string, meta?: unknown) => log("error", msg, meta),
  debug: (msg: string, meta?: unknown) => log("debug", msg, meta),
};
