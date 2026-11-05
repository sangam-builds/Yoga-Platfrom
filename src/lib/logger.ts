import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "password",
      "*.password",
      "secret",
      "*.secret",
      "signature",
      "*.signature",
      "token",
      "*.token",
      "card",
      "*.card",
      "upi",
      "*.upi",
      "cvv",
      "*.cvv",
      "payload.payment.entity.notes",
      "headers.authorization",
      "headers['x-razorpay-signature']",
    ],
    censor: "[REDACTED]",
  },
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

