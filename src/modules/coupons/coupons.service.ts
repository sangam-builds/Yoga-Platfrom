import { prisma } from "@/lib/prisma";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import type { Coupon, DiscountType } from "@prisma/client";

export interface CouponValidationResult {
  couponId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmountPaise: number;
  description: string | null;
}

export class CouponsService {
  async validateCoupon(input: {
    code: string;
    planId: string;
    userId: string;
    grossAmountPaise: number;
  }): Promise<CouponValidationResult> {
    const code = input.code.trim().toUpperCase();

    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: {
        plans: { select: { id: true } },
        _count: { select: { redemptions: true } },
      },
    });

    if (!coupon || !coupon.isActive) {
      throw new NotFoundError("Promo code is invalid or no longer active.");
    }

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      throw new BadRequestError("Promo code is not yet active.");
    }
    if (coupon.validTo && coupon.validTo < now) {
      throw new BadRequestError("Promo code has expired.");
    }

    if (coupon.maxRedemptions && coupon._count.redemptions >= coupon.maxRedemptions) {
      throw new BadRequestError("Promo code has reached its maximum total redemptions.");
    }

    // Check per-user limit
    const userRedemptions = await prisma.couponRedemption.count({
      where: {
        couponId: coupon.id,
        userId: input.userId,
      },
    });

    if (userRedemptions >= coupon.perUserLimit) {
      throw new BadRequestError("You have already reached the redemption limit for this promo code.");
    }

    // Check plan restriction (if any plans are linked)
    if (coupon.plans.length > 0) {
      const isApplicable = coupon.plans.some((p) => p.id === input.planId);
      if (!isApplicable) {
        throw new BadRequestError("This promo code is not applicable to the selected plan.");
      }
    }

    // Check minimum purchase amount
    if (coupon.minAmount && input.grossAmountPaise < coupon.minAmount) {
      throw new BadRequestError(
        `Order amount must be at least ₹${(coupon.minAmount / 100).toFixed(0)} to use this promo code.`
      );
    }

    // Calculate discount in paise
    let discountAmountPaise = 0;
    if (coupon.discountType === "PERCENT") {
      discountAmountPaise = Math.round((input.grossAmountPaise * coupon.discountValue) / 100);
    } else {
      // FIXED paise
      discountAmountPaise = Math.min(coupon.discountValue, input.grossAmountPaise);
    }

    // Cannot exceed gross amount
    discountAmountPaise = Math.min(discountAmountPaise, input.grossAmountPaise);

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmountPaise,
      description: coupon.description,
    };
  }
}

export const couponsService = new CouponsService();
