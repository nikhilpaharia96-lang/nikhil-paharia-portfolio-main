const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let loadPromise: Promise<boolean> | null = null;

/**
 * Loads the Razorpay Checkout script once and caches the promise so repeat
 * calls (e.g. retrying a payment) don't inject the script twice.
 */
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve(true);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${RAZORPAY_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return loadPromise;
}
