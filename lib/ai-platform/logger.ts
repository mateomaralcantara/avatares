import pino from "pino";

export const platformLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: { service: "avatares-ai-platform" }
});
