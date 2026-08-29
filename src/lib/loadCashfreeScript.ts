const CASHFREE_SRC = "https://sdk.cashfree.com/js/v3/cashfree.js";

let loadPromise: Promise<boolean> | null = null;

/**
 * Loads the Cashfree Checkout script once and caches the promise so repeat
 * calls (e.g. retrying a payment) don't inject the script twice.
 */
export function loadCashfreeScript(): Promise<boolean> {
  if (typeof window !== "undefined" && window.Cashfree) {
    return Promise.resolve(true);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${CASHFREE_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = CASHFREE_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return loadPromise;
}
