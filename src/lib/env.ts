import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  RAZORPAY_KEY_ID: z.string().default("rzp_test_zenflowdemo123"),
  RAZORPAY_KEY_SECRET: z.string().default("zenflow_test_secret_demo456"),
  RAZORPAY_WEBHOOK_SECRET: z.string().default("zenflow_webhook_secret_789"),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().default("rzp_test_zenflowdemo123"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment configuration.");
}

export const env = parsed.data;

/**
 * Non-production environment test-key guard:
 * Refuses to start with a live key in development/staging.
 */
if (env.NODE_ENV !== "production") {
  if (env.RAZORPAY_KEY_ID && !env.RAZORPAY_KEY_ID.startsWith("rzp_test_")) {
    const errorMsg = `FATAL SECURITY GUARD: Live Razorpay Key ID (${env.RAZORPAY_KEY_ID}) detected in non-production (${env.NODE_ENV}). Key must start with 'rzp_test_'`;
    console.error(`🚨 ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

