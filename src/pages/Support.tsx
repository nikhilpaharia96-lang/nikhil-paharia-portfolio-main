import { useState, useRef, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiShieldCheckFill,
  RiArrowLeftLine,
  RiLoader4Line,
  RiLockFill,
  RiBookOpenFill,
  RiFlashlightFill,
  RiTeamFill,
  RiHeart3Fill,
  RiUserLine,
  RiGraduationCapLine,
  RiCloseLine,
  RiInformationFill,
  RiArrowRightSLine,
  RiAlertLine,
  RiArrowDownSLine,
  RiSparkling2Fill,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { loadRazorpayScript } from "@/lib/loadRazorpayScript";
import type { RazorpayCheckoutResponse } from "@/types/razorpay";
import { loadCashfreeScript } from "@/lib/loadCashfreeScript";
import {
  SEMESTERS,
  type Semester,
  isValidSemester,
  getMinAmountForSemester,
  getDefaultAmountForSemester,
  getQuickAmountsForSemester,
} from "../../shared/semesterRules";

type PaymentStatus = "idle" | "loading" | "success" | "failed";
type Gateway = "razorpay" | "cashfree";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Support() {
  const [studentName, setStudentName] = useState<string>("");
  const [semester, setSemester] = useState<Semester | "">("");
  const [gateway, setGateway] = useState<Gateway>("cashfree");
  const [amount, setAmount] = useState<string>(String(getDefaultAmountForSemester("")));
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [touched, setTouched] = useState<{ name?: boolean; semester?: boolean }>({});
  const [semesterFocused, setSemesterFocused] = useState(false);

  // Successful-payment context, captured once verification succeeds, so the
  // success screen can show the right name/amount even though the form
  // fields above it aren't re-read at that point.
  const [receipt, setReceipt] = useState<{ name: string; semester: string; amount: number; paymentId: string } | null>(null);

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

  const trimmedName = studentName.trim();
  const isNameValid = trimmedName.length > 0 && trimmedName.length <= 100;
  const isSemesterValid = isValidSemester(semester);

  // Minimum contribution and quick-amount chips both depend on the
  // selected semester — see shared/semesterRules.ts for the source of truth.
  const minAmountForSemester = getMinAmountForSemester(semester);
  const quickAmounts = getQuickAmountsForSemester(semester);

  const parsedAmount = Number(amount);
  const isValidAmount =
    amount.trim() !== "" &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    Number.isInteger(parsedAmount) &&
    parsedAmount >= minAmountForSemester &&
    parsedAmount <= 500000;

  const isFormValid = isNameValid && isSemesterValid && isValidAmount;

  const handleAmountChange = (value: string) => {
    // Allow only digits so negative/zero/decimal-junk can't be typed.
    const sanitized = value.replace(/[^0-9]/g, "");
    setAmount(sanitized);
  };

  const handleSemesterChange = (value: string) => {
    if (!isValidSemester(value)) {
      setSemester("");
      return;
    }
    setSemester(value);
    // Auto-fill / reset the amount to this semester's minimum every time
    // the semester selection changes, per the Teacher's Day contribution
    // rules — the student can still raise it manually afterwards.
    setAmount(String(getDefaultAmountForSemester(value)));
  };

  // Entry point for the form's submit — the only thing this does is route
  // to whichever gateway the student picked in the payment-method selector
  // below. Both branches share the exact same client-side validation above
  // and both are verified server-side before ever reaching the success screen.
  const startPayment = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, semester: true });
    if (!isFormValid || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    paymentHandledRef.current = false;
    setErrorMessage("");
    setStatus("loading");

    if (gateway === "cashfree") {
      await startCashfreePayment();
      return;
    }

    await startRazorpayPayment();
  };

  const startRazorpayPayment = async () => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Could not load the payment window. Check your connection and try again.");
      }

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount, studentName: trimmedName, semester }),
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
        name: "Teacher's Day Celebration 2026",
        description: `Contribution by ${trimmedName} (${semester})`,
        theme: { color: "#1D6FEB" },
        prefill: { name: trimmedName },
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
              body: JSON.stringify({ ...response, studentName: trimmedName, semester, amount: parsedAmount }),
            });
            const verifyData = await verifyRes.json();

            // The ONLY path to the success screen: a 200 response with
            // verified === true from our server, which only happens after
            // a valid HMAC-SHA256 signature check. The frontend has no way
            // to set `status = "success"` on its own.
            if (verifyRes.ok && verifyData.verified === true) {
              setReceipt({
                name: trimmedName,
                semester,
                amount: parsedAmount,
                paymentId: verifyData.paymentId || response.razorpay_payment_id,
              });
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

  const startCashfreePayment = async () => {
    try {
      const scriptLoaded = await loadCashfreeScript();
      if (!scriptLoaded || !window.Cashfree) {
        throw new Error("Could not load the payment window. Check your connection and try again.");
      }

      const orderRes = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount, studentName: trimmedName, semester }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData?.error || "Could not start payment.");
      }

      const cashfree = window.Cashfree({ mode: orderData.cashfreeEnv === "PRODUCTION" ? "production" : "sandbox" });

      // Unlike Razorpay's `handler` callback, Cashfree's Drop-in checkout
      // never hands the browser a signed "this succeeded" payload — its
      // promise here only tells us the checkout attempt is *over*, not
      // whether it succeeded. So regardless of the outcome below, the
      // actual success/failure decision always comes from our own server
      // in the /api/cashfree/verify-payment call further down, which asks
      // Cashfree's API directly. Mark this as "being handled" now so a
      // stray retry can't race with verification below.
      paymentHandledRef.current = true;
      const result = await cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: "_modal",
      });

      const verifyRes = await fetch("/api/cashfree/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId, studentName: trimmedName, semester, amount: parsedAmount }),
      });
      const verifyData = await verifyRes.json();

      // The ONLY path to the success screen: a 200 response with
      // verified === true from our server, which only happens after
      // Cashfree's own API confirms the order was actually paid.
      if (verifyRes.ok && verifyData.verified === true) {
        setReceipt({
          name: trimmedName,
          semester,
          amount: parsedAmount,
          paymentId: verifyData.paymentId || orderData.orderId,
        });
        setStatus("success");
      } else {
        setErrorMessage(verifyData?.error || (result.error ? "Payment was not completed." : "We couldn't verify this payment."));
        setStatus("failed");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setStatus("failed");
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const resetToForm = () => {
    isSubmittingRef.current = false;
    paymentHandledRef.current = false;
    setStatus("idle");
    setErrorMessage("");
  };

  const isLoading = status === "loading";

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex items-start sm:items-center justify-center px-4 py-6 sm:py-16">
      {/* Soft lavender/purple atmosphere — ambient blurred glows behind everything */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-sky-300/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-violet-300/10 blur-3xl" />
      </div>

      {/* Decorative Teacher's Day layer — built entirely from CSS shapes and
          the icon set already used elsewhere on the page (no external image
          files required). Rules followed throughout:
          - pointer-events-none + aria-hidden: never intercepts clicks or screen readers
          - positioned behind the card (-z-10) and clipped by overflow-hidden,
            so nothing can ever sit over text/inputs/buttons or cause horizontal scroll
          - individual icon accents are hidden below `lg` so they never
            crowd the form on phones/tablets; soft gradient blobs stay subtle
            and visible at all sizes */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
        {/* Ambient gradient blobs — visible at all sizes, very low opacity */}
        <div className="absolute -top-16 -right-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-blue-300/20 to-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-24 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-sky-300/15 to-violet-300/10 blur-3xl" />

        {/* Distributed icon accents — desktop/wide screens only */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:flex absolute top-16 left-10 xl:left-24 w-14 h-14 xl:w-16 xl:h-16 rounded-2xl border border-blue-100 bg-white/60 shadow-sm items-center justify-center"
        >
          <RiGraduationCapLine className="text-2xl text-primary/70" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          className="hidden lg:flex absolute top-24 right-12 xl:right-28 w-11 h-11 xl:w-12 xl:h-12 rounded-full border border-blue-100 bg-white/60 shadow-sm items-center justify-center"
        >
          <RiBookOpenFill className="text-lg text-primary/60" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="hidden xl:flex absolute bottom-40 right-16 2xl:right-32 w-12 h-12 rounded-full border border-blue-100 bg-white/60 shadow-sm items-center justify-center"
        >
          <RiHeart3Fill className="text-lg text-primary/60" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="hidden lg:block absolute bottom-28 left-12 xl:left-28 w-3 h-3 rounded-full bg-primary/25"
        />
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="hidden xl:block absolute top-1/2 left-8 2xl:left-20 w-2.5 h-2.5 rounded-full bg-sky-400/30"
        />
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="hidden xl:block absolute bottom-16 right-10 2xl:right-24 w-2 h-2 rounded-full bg-violet-400/25"
        />
      </div>

      <div className="w-full max-w-md mx-auto relative">
        {/* Back to portfolio */}
        <motion.a
          href="/"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="interactive inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors mb-4 sm:mb-8"
        >
          <RiArrowLeftLine className="text-base" />
          Back to Portfolio
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease }}
          className="glass-premium p-5 sm:p-10 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {status === "success" && receipt ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                className="text-center py-4 sm:py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
                  className="w-16 h-16 mx-auto mb-5 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <RiHeart3Fill className="text-3xl text-primary" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
                  Payment Successful
                </h1>
                <p className="text-slate-600 font-semibold mb-1">
                  Thank you, {receipt.name}!
                </p>
                <p className="text-slate-500 mb-6 leading-relaxed text-sm sm:text-base">
                  Your contribution of ₹{receipt.amount} towards Teacher's Day Celebration 2026 has been successfully received.
                </p>
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 mb-6 text-left space-y-2.5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Semester</p>
                    <p className="text-sm font-medium text-slate-600">{receipt.semester}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Amount</p>
                    <p className="text-sm font-medium text-slate-600">₹{receipt.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Payment ID</p>
                    <p className="text-sm font-mono text-slate-600 break-all">{receipt.paymentId}</p>
                  </div>
                </div>
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
                className="text-center py-4 sm:py-6"
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
                  <RiCloseLine className="text-3xl text-red-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-3">
                  {errorMessage === "Payment cancelled" ? "Payment cancelled" : "Something went wrong"}
                </h1>
                <p className="text-slate-500 mb-8 leading-relaxed text-sm sm:text-base">
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
                {/* Icon + heading */}
                <div className="text-center mb-5 sm:mb-8 relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease }}
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-3 sm:mb-5 border border-blue-100 shadow-sm bg-gradient-to-br from-primary/10 to-sky-300/10 flex items-center justify-center"
                  >
                    <RiGraduationCapLine className="text-2xl sm:text-3xl text-primary" />
                    {/* Small sparkle accent — sits just outside the badge corner, never over the icon or heading text */}
                    <RiSparkling2Fill
                      aria-hidden="true"
                      className="pointer-events-none select-none absolute -top-2 -right-2 text-lg sm:text-xl text-amber-400"
                    />
                  </motion.div>
                  <h1 className="text-2xl sm:text-4xl font-serif font-bold text-foreground mb-1 sm:mb-2 leading-tight">
                    Teacher's Day
                  </h1>
                  <p className="text-lg sm:text-2xl font-serif font-bold text-primary mb-2 sm:mb-3">
                    Celebration 2026
                  </p>
                  <h2 className="text-sm sm:text-base font-bold text-foreground mb-2">
                    Make Your Contribution
                  </h2>
                  <p className="text-slate-500 leading-relaxed text-xs sm:text-sm max-w-sm mx-auto">
                    We are collecting contributions from students to help organize our Teacher's Day celebration.
                    Your contribution will help us make the celebration special and memorable for our teachers.
                  </p>
                </div>

                <form onSubmit={startPayment} className="space-y-4 sm:space-y-5">
                  {/* Student name — same visual language as the Contact form fields */}
                  <div>
                    <label
                      htmlFor="student-name"
                      className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
                    >
                      Student Name
                    </label>
                    <div className="relative">
                      <RiUserLine className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-300 ${
                        touched.name && !isNameValid ? "text-red-400" : "text-slate-400"
                      }`} />
                      <input
                        id="student-name"
                        name="studentName"
                        type="text"
                        autoComplete="name"
                        maxLength={100}
                        aria-required="true"
                        aria-invalid={touched.name && !isNameValid}
                        aria-describedby={touched.name && !isNameValid ? "student-name-error" : undefined}
                        disabled={isLoading}
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                        placeholder="Enter your full name"
                        className={`w-full h-12 sm:h-14 pl-11 pr-4 rounded-xl border bg-white/70 text-sm sm:text-base font-medium text-foreground shadow-sm focus:outline-none focus-visible:ring-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
                          touched.name && !isNameValid
                            ? "border-red-400 focus-visible:ring-red-200"
                            : "border-slate-200 hover:border-slate-300 focus-visible:ring-primary/25 focus-visible:border-primary"
                        }`}
                      />
                    </div>
                    <AnimatePresence>
                      {touched.name && !isNameValid && (
                        <motion.p
                          id="student-name-error"
                          role="alert"
                          initial={{ opacity: 0, y: -4, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -4, height: 0 }}
                          className="flex items-center gap-1.5 text-red-500 text-xs font-medium mt-1.5 pl-1"
                        >
                          <RiAlertLine className="w-3.5 h-3.5 shrink-0" /> Please enter your name
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Semester dropdown — same shell as the name field */}
                  <div>
                    <label
                      htmlFor="student-semester"
                      className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
                    >
                      Semester
                    </label>
                    <div className="relative">
                      <RiBookOpenFill className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] z-10 pointer-events-none transition-colors duration-300 ${
                        touched.semester && !isSemesterValid ? "text-red-400" : semesterFocused ? "text-primary" : "text-slate-400"
                      }`} />
                      <select
                        id="student-semester"
                        name="semester"
                        value={semester}
                        disabled={isLoading}
                        aria-required="true"
                        aria-invalid={touched.semester && !isSemesterValid}
                        aria-describedby={touched.semester && !isSemesterValid ? "student-semester-error" : undefined}
                        onFocus={() => setSemesterFocused(true)}
                        onBlur={() => {
                          setSemesterFocused(false);
                          setTouched((t) => ({ ...t, semester: true }));
                        }}
                        onChange={(e) => handleSemesterChange(e.target.value)}
                        className={`w-full h-12 sm:h-14 appearance-none pl-11 pr-11 rounded-xl border bg-white/70 text-sm sm:text-base font-medium cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
                          semester ? "text-foreground" : "text-slate-400"
                        } ${
                          touched.semester && !isSemesterValid
                            ? "border-red-400 focus-visible:ring-red-200"
                            : "border-slate-200 hover:border-slate-300 focus-visible:ring-primary/25 focus-visible:border-primary"
                        }`}
                      >
                        <option value="" disabled hidden>
                          Select your semester
                        </option>
                        {SEMESTERS.map((s) => (
                          <option key={s} value={s} className="text-foreground bg-white">
                            {s}
                          </option>
                        ))}
                      </select>
                      <RiArrowDownSLine className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-300 ${
                        touched.semester && !isSemesterValid ? "text-red-400" : semesterFocused ? "text-primary" : "text-slate-400"
                      }`} />
                    </div>
                    <AnimatePresence>
                      {touched.semester && !isSemesterValid && (
                        <motion.p
                          id="student-semester-error"
                          role="alert"
                          initial={{ opacity: 0, y: -4, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -4, height: 0 }}
                          className="flex items-center gap-1.5 text-red-500 text-xs font-medium mt-1.5 pl-1"
                        >
                          <RiAlertLine className="w-3.5 h-3.5 shrink-0" /> Please select your semester
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Contribution amount */}
                  <div>
                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <label htmlFor="support-amount" className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                        Enter Contribution Amount
                      </label>
                      {isSemesterValid && (
                        <span className="text-[11px] font-semibold text-primary whitespace-nowrap">
                          Min ₹{minAmountForSemester}
                        </span>
                      )}
                    </div>
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
                        disabled={isLoading}
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder="Enter Amount"
                        className="w-full h-12 sm:h-14 pl-9 pr-4 rounded-xl border border-blue-100 bg-white text-xl sm:text-2xl font-bold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <p id="amount-help" className="text-xs text-slate-400 mt-2">
                      {isValidAmount
                        ? "\u00A0"
                        : `Enter a whole number amount of ₹${minAmountForSemester} or more.`}
                    </p>

                    {/* Quick-select — 2x2 grid on mobile, row on larger screens.
                        Options depend on the selected semester and are always
                        >= that semester's minimum (see shared/semesterRules.ts). */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {quickAmounts.map((val) => (
                        <button
                          key={val}
                          type="button"
                          disabled={isLoading}
                          onClick={() => setAmount(String(val))}
                          className={`interactive px-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-colors min-h-[40px] disabled:opacity-60 disabled:cursor-not-allowed ${
                            amount === String(val)
                              ? "bg-primary text-white border-primary shadow-sm shadow-blue-200"
                              : "bg-white text-slate-600 border-blue-100 hover:border-primary hover:text-primary"
                          }`}
                        >
                          ₹{val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment method — same chip styling as the quick-amount
                      buttons above, so it reads as part of the same form
                      rather than a bolted-on addition. */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["cashfree", "razorpay"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          disabled={isLoading}
                          onClick={() => setGateway(option)}
                          aria-pressed={gateway === option}
                          className={`interactive px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-colors min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed ${
                            gateway === option
                              ? "bg-primary text-white border-primary shadow-sm shadow-blue-200"
                              : "bg-white text-slate-600 border-blue-100 hover:border-primary hover:text-primary"
                          }`}
                        >
                          {option === "razorpay" ? "Razorpay" : "Cashfree"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full min-h-[48px] text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <>
                        <RiLoader4Line className="animate-spin text-lg" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RiLockFill className="text-base" />
                        Pay Securely
                        <RiArrowRightSLine className="text-lg" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                    <RiShieldCheckFill className="text-sm text-primary" />
                    Secured by {gateway === "cashfree" ? "Cashfree" : "Razorpay"} · Payments are encrypted
                  </div>
                </form>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 pt-5 border-t border-blue-100/70">
                  {[
                    { Icon: RiShieldCheckFill, title: "100% Secure", desc: `Safe with ${gateway === "cashfree" ? "Cashfree" : "Razorpay"}` },
                    { Icon: RiFlashlightFill, title: "Instant Payment", desc: "Quick & seamless" },
                    { Icon: RiTeamFill, title: "For Our Teachers", desc: "Makes it special" },
                  ].map(({ Icon, title, desc }) => (
                    <div key={title} className="flex flex-col items-center text-center gap-1.5">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full border border-primary/25 bg-primary/5 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-medium text-slate-600 leading-tight">
                        <span className="block font-semibold text-slate-700">{title}</span>
                        <span className="hidden sm:inline">{desc}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Note card */}
        {status !== "success" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
            className="relative mt-4 sm:mt-6 rounded-2xl border border-blue-100 bg-white/70 backdrop-blur-sm px-4 py-3 sm:py-4 flex items-start gap-3"
          >
            {/* Small heart accent — sits outside the card's top-right corner, never over the note text */}
            <div
              aria-hidden="true"
              className="hidden sm:flex pointer-events-none select-none absolute -top-3 -right-3 w-7 h-7 rounded-full bg-primary/10 border border-blue-100 items-center justify-center"
            >
              <RiHeart3Fill className="w-3.5 h-3.5 text-primary/80" />
            </div>
            <div className="w-7 h-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <RiInformationFill className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-600">Note:</span> This contribution is for Teacher's Day Celebration 2026, organized by the students.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
