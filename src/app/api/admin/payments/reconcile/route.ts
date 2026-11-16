import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/rbac/server";
import { paymentsReconciliationService } from "@/modules/payments/payments.reconciliation";

export const POST = createApiHandler(async () => {
  await requireAdmin();

  const summary = await paymentsReconciliationService.reconcilePendingPayments(30);

  return NextResponse.json({
    success: true,
    summary,
  });
});
