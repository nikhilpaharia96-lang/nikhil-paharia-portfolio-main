export interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  redirectTarget?: "_self" | "_blank" | "_top" | "_modal";
  returnUrl?: string;
}

export interface CashfreeCheckoutResult {
  error?: { message?: string };
  redirect?: boolean;
  paymentDetails?: { paymentMessage?: string };
}

export interface CashfreeInstance {
  checkout: (options: CashfreeCheckoutOptions) => Promise<CashfreeCheckoutResult>;
}

declare global {
  interface Window {
    Cashfree?: (config: { mode: "sandbox" | "production" }) => CashfreeInstance;
  }
}
