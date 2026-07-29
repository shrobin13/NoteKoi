import { env } from "../config/index.js";
function log(level, message, meta) {
    if (level === "debug" && env.NODE_ENV === "production")
        return;
    const ts = new Date().toISOString();
    const prefix = `[${ts}] [${level.toUpperCase()}]`;
    if (meta !== undefined) {
        console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](prefix, message, meta);
    }
    else {
        console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](prefix, message);
    }
}
export const logger = {
    info: (msg, meta) => log("info", msg, meta),
    warn: (msg, meta) => log("warn", msg, meta),
    error: (msg, meta) => log("error", msg, meta),
    debug: (msg, meta) => log("debug", msg, meta),
};
