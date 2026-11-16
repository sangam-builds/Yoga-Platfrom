import { z } from "zod";

export const CreateCheckoutSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  promoCode: z.string().trim().max(30).optional().nullable(),
  billingInterval: z.enum(["MONTH", "YEAR"]).optional(),
});

export type CreateCheckoutInput = z.infer<typeof CreateCheckoutSchema>;

export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
  razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
  razorpay_signature: z.string().min(1, "razorpay_signature is required"),
});

export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;

export const ValidateCouponSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required"),
  planId: z.string().min(1, "Plan ID is required"),
});

export type ValidateCouponInput = z.infer<typeof ValidateCouponSchema>;

export const RefundPaymentSchema = z.object({
  amount: z.number().int().positive().optional(), // in paise
  reason: z.string().trim().min(3, "Reason must be at least 3 characters"),
  stepUpPassword: z.string().optional(),
});

export type RefundPaymentInput = z.infer<typeof RefundPaymentSchema>;
