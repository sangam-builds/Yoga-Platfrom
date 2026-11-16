import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/rbac/server";
import { prisma } from "@/lib/prisma";

export const GET = createApiHandler(async (request: Request) => {
  const { dbUser } = await requireAdmin();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const planId = searchParams.get("planId");
  const method = searchParams.get("method");
  const search = searchParams.get("search")?.trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const isExport = searchParams.get("export") === "csv";

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(Number(searchParams.get("pageSize")) || 20, 100);

  const where: any = {};

  if (status && status !== "ALL") {
    where.status = status;
  }
  if (planId && planId !== "ALL") {
    where.planId = planId;
  }
  if (method && method !== "ALL") {
    where.method = method;
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  if (search) {
    where.OR = [
      { providerOrderId: { contains: search, mode: "insensitive" } },
      { providerPaymentId: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Handle CSV export
  if (isExport) {
    const allPayments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1000,
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { name: true } },
      },
    });

    const headers = [
      "Payment ID",
      "Date",
      "Customer Name",
      "Customer Email",
      "Plan",
      "Amount (INR)",
      "Status",
      "Method",
      "Razorpay Order ID",
      "Razorpay Payment ID",
    ];

    const rows = allPayments.map((p) => [
      p.id,
      p.createdAt.toISOString(),
      `"${p.user?.name || ""}"`,
      `"${p.user?.email || ""}"`,
      `"${p.plan?.name || ""}"`,
      (p.amount / 100).toFixed(2),
      p.status,
      p.method || "card",
      p.providerOrderId || "",
      p.providerPaymentId || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=zenflow_payments_${new Date().toISOString().slice(0, 10)}.csv`,
      },
    });
  }

  // Paginated queries
  const [payments, totalCount] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, name: true, interval: true } },
        refunds: true,
        couponRedemption: { include: { coupon: { select: { code: true } } } },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return NextResponse.json({
    payments: payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      taxAmount: p.taxAmount,
      discountAmount: p.discountAmount,
      currency: p.currency,
      status: p.status,
      method: p.method,
      providerOrderId: p.providerOrderId,
      providerPaymentId: p.providerPaymentId,
      paidAt: p.paidAt?.toISOString() || null,
      createdAt: p.createdAt.toISOString(),
      user: p.user,
      plan: p.plan,
      refunds: p.refunds,
      couponCode: p.couponRedemption?.coupon?.code || null,
    })),
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    },
  });
});
