import { useState, useRef, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiHeart3Fill, RiShieldCheckFill, RiArrowLeftLine, RiLoader4Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { loadRazorpayScript } from "@/lib/loadRazorpayScript";
import type { RazorpayCheckoutResponse } from "@/types/razorpay";
import profilePhoto from "../assets/images/profile-nobg.png";

type PaymentStatus = "idle" | "loading" | "success" | "failed";

const ease = [0.16, 1, 0.3, 1] as const;

const QUICK_AMOUNTS = [99, 199, 499, 999];

export default function Support() {
  const [amount, setAmount] = useState<string>("199");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Hard guard against double-submit (rapid double-click / double-tap /
  // Enter-key repeat). React state alone is enough in practice since the
  // button disables synchronously before the first `await`, but a ref is
  // checked instantly, before any re-render, so it's a stronger guarantee.
  const isSubmittingRef = useRef(false);

  // True while the async `handler` callback (payment success path) from
  // Razorpay Checkout is running. Razorpay's `modal.ondismiss` can fire
  // right after checkout closes even on a successful payment, racing with
  // our own verify request — this flag stops ondismiss from clobbering a
  // payment that's already being verified.
  const paymentHandledRef = useRef(false);

  const parsedAmount = Number(amount);
  const isValidAmount =
    amount.trim() !== "" &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    Number.isInteger(parsedAmount) &&
    parsedAmount <= 500000;

  const handleAmountChange = (value: string) => {
    // Allow only digits so negative/zero/decimal-junk can't be typed.
    const sanitized = value.replace(/[^0-9]/g, "");
    setAmount(sanitized);
  };

  const startPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidAmount || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    paymentHandledRef.current = false;
    setErrorMessage("");
    setStatus("loading");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Could not load the payment window. Check your connection and try again.");
      }

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData?.error || "Could not start payment.");
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "Nikhil Paharia",
        description: "Support My Work",
        image: profilePhoto,
        theme: { color: "#1D6FEB" },
        handler: async (response: RazorpayCheckoutResponse) => {
          // Mark this as "being handled" immediately, before the await,
          // so a near-simultaneous `ondismiss` (Razorpay closes the modal
          // right after a successful payment) doesn't overwrite status
          // with a false "cancelled" while verification is in flight.
          paymentHandledRef.current = true;
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();

            // The ONLY path to the success screen: a 200 response with
            // verified === true from our server, which only happens after
            // a valid HMAC-SHA256 signature check. The frontend has no way
            // to set `status = "success"` on its own.
            if (verifyRes.ok && verifyData.verified === true) {
              setStatus("success");
            } else {
              setErrorMessage(verifyData?.error || "We couldn't verify this payment.");
              setStatus("failed");
            }
          } catch {
            setErrorMessage("We couldn't verify this payment. Please contact support if you were charged.");
            setStatus("failed");
          } finally {
            isSubmittingRef.current = false;
          }
        },
        modal: {
          ondismiss: () => {
            // Ignore if a successful-payment handler is already resolving
            // this attempt — see paymentHandledRef comment above.
            if (paymentHandledRef.current) return;
            isSubmittingRef.current = false;
            setStatus((prev) => (prev === "loading" ? "failed" : prev));
            setErrorMessage("Payment cancelled");
          },
        },
      });

      razorpay.on("payment.failed", () => {
        isSubmittingRef.current = false;
        setErrorMessage("Something went wrong");
        setStatus("failed");
      });

      razorpay.open();
    } catch (err) {
      isSubmittingRef.current = false;
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setStatus("failed");
    }
  };

  const resetToForm = () => {
    isSubmittingRef.current = false;
    paymentHandledRef.current = false;
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex items-center justify-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-md mx-auto">
        {/* Back to portfolio */}
        <motion.a
          href="/"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="interactive inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors mb-8"
        >
          <RiArrowLeftLine className="text-base" />
          Back to Portfolio
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease }}
          className="glass-premium p-6 sm:p-10 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <RiHeart3Fill className="text-3xl text-primary" />
                </motion.div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">
                  Thank You <span aria-hidden>❤️</span>
                </h1>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  Your support means a lot and helps me continue creating.
                </p>
                <Button asChild size="lg" className="btn-primary w-full sm:w-auto">
                  <a href="/">Back to Portfolio</a>
                </Button>
              </motion.div>
            ) : status === "failed" ? (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                  <span className="text-3xl" aria-hidden>✕</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3">
                  {errorMessage === "Payment cancelled" ? "Payment cancelled" : "Something went wrong"}
                </h1>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  {errorMessage && errorMessage !== "Payment cancelled" && errorMessage !== "Something went wrong"
                    ? errorMessage
                    : "You can try again whenever you're ready."}
                </p>
                <Button onClick={resetToForm} size="lg" className="btn-primary w-full sm:w-auto">
                  Try Again
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Avatar + heading */}
                <div className="text-center mb-8">
                  <motion.img
                    src={profilePhoto}
                    alt="Nikhil Paharia"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease }}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-5 border-2 border-blue-100 shadow-sm bg-blue-50"
                  />
                  <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">
                    Support My Work
                  </h1>
                  <p className="text-slate-500 leading-relaxed">
                    If you enjoy my work and want to support what I create, you can contribute any amount.
                  </p>
                </div>

                {/* Personal message */}
                <p className="text-sm text-slate-500 italic text-center mb-8 leading-relaxed">
                  Every bit of support helps me keep building, learning, and sharing projects like this one.
                  Thank you for stopping by.
                </p>

                <form onSubmit={startPayment} className="space-y-6">
                  <div>
                    <label htmlFor="support-amount" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Enter Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400 select-none">
                        ₹
                      </span>
                      <input
                        id="support-amount"
                        name="amount"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                        aria-describedby="amount-help"
                        aria-invalid={!isValidAmount}
                        disabled={status === "loading"}
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder="Enter Amount"
                        className="w-full h-14 pl-9 pr-4 rounded-xl border border-blue-100 bg-white text-2xl font-bold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <p id="amount-help" className="text-xs text-slate-400 mt-2">
                      {isValidAmount ? "\u00A0" : "Enter a whole number amount of ₹1 or more."}
                    </p>

                    {/* Quick-select chips */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {QUICK_AMOUNTS.map((val) => (
                        <button
                          key={val}
                          type="button"
                          disabled={status === "loading"}
                          onClick={() => setAmount(String(val))}
                          className={`interactive px-4 py-2 rounded-full text-sm font-semibold border transition-colors min-h-[40px] disabled:opacity-60 disabled:cursor-not-allowed ${
                            amount === String(val)
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-slate-600 border-blue-100 hover:border-primary hover:text-primary"
                          }`}
                        >
                          ₹{val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!isValidAmount || status === "loading"}
                    className="btn-primary w-full min-h-[48px] text-base"
                  >
                    {status === "loading" ? (
                      <>
                        <RiLoader4Line className="animate-spin text-lg" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RiHeart3Fill className="text-lg" />
                        Pay Now
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                    <RiShieldCheckFill className="text-sm text-primary" />
                    Secured by Razorpay · payments are encrypted
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
