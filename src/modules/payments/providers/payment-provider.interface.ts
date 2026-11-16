export interface CreateOrderInput {
  amount: number; // In paise (integer)
  currency?: string; // Default "INR"
  receipt: string; // Max 40 alphanumeric characters
  notes?: Record<string, string>;
}

export interface ProviderOrder {
  id: string; // Razorpay order id e.g. "order_xxx"
  amount: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
  createdAt: number;
}

export interface ProviderPayment {
  id: string; // Razorpay payment id e.g. "pay_xxx"
  orderId: string | null;
  amount: number; // In paise
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  method?: string; // "card" | "upi" | "netbanking" | "wallet"
  email?: string;
  contact?: string;
  captured: boolean;
  failureReason?: string | null;
  raw?: unknown;
}

export interface RefundInput {
  paymentId: string;
  amount?: number; // In paise; omit or pass full for full refund
  notes?: Record<string, string>;
  receipt?: string;
}

export interface ProviderRefund {
  id: string; // Razorpay refund id e.g. "rfnd_xxx"
  paymentId: string;
  amount: number; // In paise
  currency: string;
  status: "pending" | "processed" | "failed";
  createdAt: number;
}

export interface PaymentProvider {
  /** Returns current mode (TEST or LIVE) based on credentials */
  getMode(): "TEST" | "LIVE";

  /** Creates an order with Razorpay Orders API */
  createOrder(input: CreateOrderInput): Promise<ProviderOrder>;

  /** Retrieves detailed payment status from Razorpay Payments API */
  fetchPayment(paymentId: string): Promise<ProviderPayment>;

  /** Captures an authorized payment */
  capturePayment(paymentId: string, amount: number, currency?: string): Promise<ProviderPayment>;

  /** Executes a full or partial refund */
  refundPayment(input: RefundInput): Promise<ProviderRefund>;

  /** Verifies HMAC SHA256 checkout signature using constant-time comparison */
  verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean;

  /** Verifies raw webhook payload signature using constant-time comparison */
  verifyWebhookSignature(rawBody: string, signature: string, secret?: string): boolean;
}
