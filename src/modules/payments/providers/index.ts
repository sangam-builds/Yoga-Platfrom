import { env } from "@/lib/env";
import { PaymentProvider } from "./payment-provider.interface";
import { RazorpayProvider } from "./razorpay.provider";

let defaultPaymentProvider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (!defaultPaymentProvider) {
    defaultPaymentProvider = new RazorpayProvider({
      keyId: env.RAZORPAY_KEY_ID,
      keySecret: env.RAZORPAY_KEY_SECRET,
      webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
      environment: env.NODE_ENV,
    });
  }
  return defaultPaymentProvider;
}

export * from "./payment-provider.interface";
export * from "./razorpay.signature";
export * from "./razorpay.provider";
