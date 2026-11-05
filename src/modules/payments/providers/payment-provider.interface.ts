export interface CreateOrderParams {
  amountPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface ProviderOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface ProviderPaymentDetails {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: "captured" | "authorized" | "failed" | "refunded";
  method?: string;
  rawStatus: string;
  email?: string;
  contact?: string;
}

export interface CreateRefundParams {
  paymentId: string;
  amountPaise?: number;
  notes?: Record<string, string>;
}

export interface ProviderRefundResult {
  id: string;
  paymentId: string;
  amount: number;
  status: string;
}

export interface PaymentProvider {
  createOrder(params: CreateOrderParams): Promise<ProviderOrder>;
  fetchPayment(paymentId: string): Promise<ProviderPaymentDetails>;
  capturePayment(paymentId: string, amountPaise: number, currency: string): Promise<ProviderPaymentDetails>;
  refund(params: CreateRefundParams): Promise<ProviderRefundResult>;
  verifyCheckoutSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  getPublicKey(): string;
}

