import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Loader2, Lock, ShieldCheck, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { payBookingToken, PaymentError, type BookingReceipt } from "@/lib/booking";
import { getServiceDetail } from "@/constants/serviceDetails";
import {
  SERVICE_PRICES, SERVICE_SLUGS, computeQuote, normalizeSplit, formatINR, MAX_PROJECT_TOTAL_INR, type ServiceSlug,
} from "../../../shared/servicePricing";
import { validateBookingInput, WEBSITE_TYPES, WEBSITE_TYPE_SERVICES, istToday, type BookingInput } from "../../../shared/booking";

// Keep in sync with the server's BOOKING_TOKEN_PERCENT / START_ADVANCE_PERCENT (default 5 / 25).
const SPLIT = normalizeSplit(import.meta.env.VITE_BOOKING_TOKEN_PERCENT, import.meta.env.VITE_START_ADVANCE_PERCENT);
const OWNER_WA = (import.meta.env.VITE_OWNER_WHATSAPP as string | undefined)?.replace(/\D/g, "");

type Step = 0 | 1 | 2 | "paying" | "success" | "failed";
const STEP_FIELDS: Record<0 | 1, (keyof BookingInput)[]> = {
  0: ["name", "phone", "email", "company", "service"],
  1: ["websiteType", "description", "budget", "startDate"],
};
const STEP_LABELS = ["Client", "Project", "Payment"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: ServiceSlug;
  /** Budget carried over from the quotation panel on the page. */
  initialTotal: number;
}

const fieldCls =
  "w-full rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none backdrop-blur transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/15";

export default function BookingDialog({ open, onOpenChange, slug, initialTotal }: Props) {
  const rm = useReducedMotion();
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "", service: slug as string, websiteType: "", description: "", budget: String(initialTotal), startDate: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);
  const leadId = useRef<string | undefined>(undefined);
  const honeypot = useRef<HTMLInputElement>(null);
  const budgetTouched = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Each time the dialog opens (never mid-payment / after success): sync service + budget from the page.
  useEffect(() => {
    if (!open || step === "paying" || step === "success") return;
    budgetTouched.current = false;
    setForm((f) => ({ ...f, service: slug, budget: String(initialTotal) }));
    setStep(0);
    setErrors({});
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => { scroller.current?.scrollTo({ top: 0 }); }, [step]);

  const svc = form.service as ServiceSlug;
  const needsWebsiteType = WEBSITE_TYPE_SERVICES.includes(form.service);
  const budget = Number(form.budget.replace(/\D/g, "")) || 0;
  const min = SERVICE_PRICES[svc]?.startingPrice ?? 0;
  const quote = useMemo(() => computeQuote(Math.max(budget, 0), SPLIT), [budget]);

  const input: BookingInput = {
    service: form.service, name: form.name, phone: form.phone, email: form.email, company: form.company,
    websiteType: needsWebsiteType ? form.websiteType : "", description: form.description, budget, startDate: form.startDate,
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const v = k === "phone" ? e.target.value.replace(/[^\d+\s-]/g, "") : e.target.value;
    if (k === "budget") budgetTouched.current = true;
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  const changeService = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as ServiceSlug;
    setForm((f) => ({
      ...f,
      service: next,
      websiteType: WEBSITE_TYPE_SERVICES.includes(next) ? f.websiteType : "",
      // Move the budget to the new service's suggested total, unless the visitor typed their own.
      budget: budgetTouched.current ? f.budget : String(getServiceDetail(next)?.suggestedTotal ?? SERVICE_PRICES[next].startingPrice),
    }));
    setErrors((er) => ({ ...er, service: "", budget: "" }));
  };

  /** Validates with the SAME function the server uses; only reports the fields on the current step. */
  const validateStep = (s: 0 | 1 | 2) => {
    const { errors: all } = validateBookingInput(input);
    const keys = s === 2 ? [...STEP_FIELDS[0], ...STEP_FIELDS[1]] : STEP_FIELDS[s];
    const er: Record<string, string> = {};
    keys.forEach((k) => { if (all[k]) er[k] = all[k] as string; });
    setErrors(er);
    if (s === 2 && Object.keys(er).length) setStep(STEP_FIELDS[0].some((k) => er[k]) ? 0 : 1);
    return Object.keys(er).length === 0;
  };

  const next = () => { if (step === 0 || step === 1) if (validateStep(step)) setStep((step + 1) as Step); };

  const pay = async () => {
    if (!validateStep(2)) { toast.error("Please fix the highlighted details."); return; }
    setStep("paying");
    setError("");
    try {
      const r = await payBookingToken(input, { leadId: leadId.current, onLead: (id) => (leadId.current = id), honeypot: honeypot.current?.value });
      setReceipt(r);
      setStep("success");
      toast.success("Booking confirmed!");
    } catch (err) {
      if (err instanceof PaymentError && err.fieldErrors) {
        const fe = Object.fromEntries(Object.entries(err.fieldErrors).filter(([, v]) => v)) as Record<string, string>;
        setErrors(fe);
        setStep(STEP_FIELDS[0].some((k) => fe[k]) ? 0 : 1);
        toast.error(err.message);
        return;
      }
      const cancelled = err instanceof PaymentError && err.cancelled;
      const msg = cancelled ? "Payment was not completed. You haven't been charged." : err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      setStep("failed");
      if (!cancelled) toast.error(msg);
    }
  };

  const closeAfterSuccess = () => {
    leadId.current = undefined;
    setReceipt(null);
    setForm((f) => ({ ...f, name: "", phone: "", email: "", company: "", websiteType: "", description: "", startDate: "" }));
    setStep(0);
    onOpenChange(false);
  };

  const busy = step === "paying";
  const inFlow = step === 0 || step === 1 || step === 2;
  const anim = rm ? {} : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.22 } };
  const waText = receipt ? encodeURIComponent(`Hi Nikhil, I've booked ${receipt.service} (Ref: ${receipt.ref}) and paid the booking token of ${formatINR(receipt.token)}.`) : "";

  return (
    <Dialog open={open} onOpenChange={(o) => (!busy ? (step === "success" ? closeAfterSuccess() : onOpenChange(o)) : undefined)}>
      <DialogContent
        data-clarity-mask="true"
        className="max-h-[94vh] w-[calc(100%-20px)] max-w-lg gap-0 overflow-hidden rounded-3xl border border-white/50 bg-white/85 p-0 shadow-[0_30px_80px_-20px_rgba(18,102,241,0.45)] backdrop-blur-2xl [&>button]:z-10 [&>button]:text-white [&>button]:opacity-80"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0b3a9e] via-[#1266f1] to-[#38a3ff] px-6 pb-5 pt-7 text-white sm:px-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100">Book this service</p>
          <DialogTitle className="mt-1 font-serif text-xl font-black uppercase tracking-tight sm:text-2xl">{SERVICE_PRICES[svc]?.title}</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-blue-50/90">
            {step === "success" ? "Your booking is confirmed." : "Three quick steps — pay only the booking token now."}
          </DialogDescription>
          {inFlow && (
            <ol className="mt-4 flex items-center gap-2" aria-label="Progress">
              {STEP_LABELS.map((l, i) => (
                <li key={l} className="flex flex-1 items-center gap-2">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold transition ${i <= (step as number) ? "bg-white text-primary" : "bg-white/20 text-white"}`}>{i < (step as number) ? "✓" : i + 1}</span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${i <= (step as number) ? "text-white" : "text-blue-100/70"}`}>{l}</span>
                  {i < 2 && <span className={`h-px flex-1 ${i < (step as number) ? "bg-white" : "bg-white/25"}`} />}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div ref={scroller} className="max-h-[calc(94vh-170px)] overflow-y-auto px-6 py-6 sm:px-8">
          <AnimatePresence mode="wait" initial={false}>
            {step === 0 && (
              <motion.div key="s0" {...anim} className="space-y-4">
                <Field label="Full name" error={errors.name}>
                  <input className={fieldCls} value={form.name} onChange={set("name")} autoComplete="name" placeholder="Your name" maxLength={100} aria-invalid={!!errors.name} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="WhatsApp number" error={errors.phone}>
                    <div className="flex">
                      <span className="flex items-center rounded-l-xl border border-r-0 border-slate-200/80 bg-slate-50 px-3 text-sm font-semibold text-slate-500">+91</span>
                      <input className={`${fieldCls} rounded-l-none`} type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} autoComplete="tel-national" placeholder="98765 43210" maxLength={16} aria-invalid={!!errors.phone} />
                    </div>
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input className={fieldCls} type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" maxLength={120} aria-invalid={!!errors.email} />
                  </Field>
                </div>
                <Field label="Business / company (optional)" error={errors.company}>
                  <input className={fieldCls} value={form.company} onChange={set("company")} autoComplete="organization" placeholder="Your business name" maxLength={100} />
                </Field>
                <Field label="Selected service" error={errors.service}>
                  <select className={fieldCls} value={form.service} onChange={changeService}>
                    {SERVICE_SLUGS.map((s) => <option key={s} value={s}>{SERVICE_PRICES[s].title}</option>)}
                  </select>
                </Field>
                {/* honeypot — hidden from people, tempting to bots */}
                <input ref={honeypot} type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" name="companyWebsite" />
                <PrimaryBtn onClick={next}>Continue <ArrowRight className="h-4 w-4" /></PrimaryBtn>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" {...anim} className="space-y-4">
                {needsWebsiteType && (
                  <Field label="Website type" error={errors.websiteType}>
                    <select className={fieldCls} value={form.websiteType} onChange={set("websiteType")} aria-invalid={!!errors.websiteType}>
                      <option value="">Select a type…</option>
                      {WEBSITE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                )}
                <Field label="Project description" error={errors.description}>
                  <textarea className={`${fieldCls} min-h-[104px] resize-y`} value={form.description} onChange={set("description")} placeholder="What do you want built / made? Goals, references, deadlines…" maxLength={2000} aria-invalid={!!errors.description} />
                </Field>
                <Field label="Expected project budget (₹)" error={errors.budget} hint={!errors.budget ? `Starts at ${formatINR(min)} · max ${formatINR(MAX_PROJECT_TOTAL_INR)} online` : undefined}>
                  <input className={`${fieldCls} font-mono font-bold`} inputMode="numeric" value={form.budget} onChange={(e) => { budgetTouched.current = true; setForm((f) => ({ ...f, budget: e.target.value.replace(/\D/g, "").slice(0, 7) })); setErrors((er) => ({ ...er, budget: "" })); }} placeholder={String(min)} aria-invalid={!!errors.budget} />
                </Field>
                <Field label="Preferred starting date (optional)" error={errors.startDate}>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input className={`${fieldCls} pl-10`} type="date" min={istToday()} value={form.startDate} onChange={set("startDate")} />
                    </div>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, startDate: istToday() }))} className="shrink-0 rounded-xl border border-primary/30 bg-primary/10 px-3 text-xs font-bold text-primary transition hover:bg-primary/15">ASAP</button>
                  </div>
                </Field>
                <div className="flex gap-3">
                  <GhostBtn onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" /> Back</GhostBtn>
                  <PrimaryBtn onClick={next}>Review payment <ArrowRight className="h-4 w-4" /></PrimaryBtn>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" {...anim} className="space-y-5">
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-sm">
                  <Row k="Name" v={form.name.trim()} />
                  <Row k="WhatsApp" v={`+91 ${input.phone.replace(/\D/g, "").slice(-10)}`} />
                  {form.company.trim() && <Row k="Business" v={form.company.trim()} />}
                  <Row k="Service" v={SERVICE_PRICES[svc].title} />
                </div>

                <div className="overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-b from-blue-50/90 to-white/80">
                  <div className="flex items-end justify-between px-4 pt-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total project cost</p>
                      <p className="font-mono text-2xl font-extrabold text-slate-900">{formatINR(quote.total)}</p>
                    </div>
                  </div>
                  <div className="mx-4 mt-3 flex h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                    <span className="bg-primary" style={{ width: `${quote.tokenPercent}%` }} />
                    <span className="bg-sky-400" style={{ width: `${quote.startPercent}%` }} />
                    <span className="bg-slate-300" style={{ width: `${quote.remainingPercent}%` }} />
                  </div>
                  <div className="space-y-1 p-4 text-sm">
                    <PayRow dot="bg-primary" label={`${quote.tokenPercent}% Booking token`} sub="Pay now" v={formatINR(quote.token)} strong />
                    <PayRow dot="bg-sky-400" label={`${quote.startPercent}% Project-start advance`} sub="When the project starts" v={formatINR(quote.startAdvance)} />
                    <PayRow dot="bg-slate-300" label={`${quote.remainingPercent}% Final payment`} sub="After completion" v={formatINR(quote.remaining)} />
                  </div>
                </div>

                <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Secure payment via Razorpay. Your booking is confirmed only after the payment is verified on our server.
                </p>
                <div className="flex gap-3">
                  <GhostBtn onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Edit</GhostBtn>
                  <PrimaryBtn onClick={pay}><Lock className="h-4 w-4" /> Pay {formatINR(quote.token)} &amp; Confirm Booking</PrimaryBtn>
                </div>
              </motion.div>
            )}

            {step === "paying" && (
              <motion.div key="paying" {...anim} className="flex flex-col items-center gap-3 py-10 text-center" role="status">
                <Loader2 className="h-9 w-9 animate-spin text-primary" />
                <p className="font-semibold text-slate-800">Waiting for payment…</p>
                <p className="max-w-xs text-sm text-slate-500">Complete the payment in the secure window. Please don't close this page.</p>
              </motion.div>
            )}

            {step === "success" && receipt && (
              <motion.div key="success" {...anim} className="space-y-5 text-center">
                <motion.div initial={rm ? false : { scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
                  <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
                </motion.div>
                <div>
                  <h3 className="font-serif text-2xl font-black text-slate-900">Booking confirmed</h3>
                  <p className="mt-1 text-sm text-slate-600">Thank you, {form.name.trim().split(" ")[0]}! I've received your booking token and will contact you on WhatsApp shortly. A confirmation was also emailed to {form.email.trim()}.</p>
                  <p className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">Ref {receipt.ref}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-left text-sm">
                  <Row k="Service" v={receipt.service} />
                  <Row k="Total project cost" v={formatINR(receipt.total)} />
                  <Row k="Booking token paid ✓" v={formatINR(receipt.token)} strong />
                  <Row k="Due at project start" v={formatINR(receipt.startAdvance)} />
                  <Row k="Due after completion" v={formatINR(receipt.remaining)} />
                  <Row k="Payment ID" v={receipt.paymentId} />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {OWNER_WA && (
                    <a href={`https://wa.me/${OWNER_WA}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-bold text-white transition hover:brightness-105">
                      <MessageCircle className="h-4 w-4" /> Message me on WhatsApp
                    </a>
                  )}
                  <button onClick={closeAfterSuccess} className="flex-1 rounded-full bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800">Done</button>
                </div>
              </motion.div>
            )}

            {step === "failed" && (
              <motion.div key="failed" {...anim} className="space-y-5 text-center" role="alert">
                <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
                <div>
                  <h3 className="font-serif text-xl font-black text-slate-900">Payment not completed</h3>
                  <p className="mt-1 text-sm text-slate-600">{error}</p>
                  <p className="mt-2 text-xs text-slate-400">Your details are saved. If money was deducted, it is refunded automatically — or contact me and I'll sort it out.</p>
                </div>
                <div className="flex gap-3">
                  <PrimaryBtn onClick={() => setStep(2)}>Try again</PrimaryBtn>
                  <GhostBtn onClick={() => onOpenChange(false)}>Close</GhostBtn>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500" role="alert">{error}</span> : hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

function PrimaryBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1266f1] to-[#0b49b8] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:brightness-110 active:scale-[0.99]">
      {children}
    </button>
  );
}
function GhostBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-white">
      {children}
    </button>
  );
}
function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-slate-500">{k}</span>
      <span className={`break-all text-right ${strong ? "text-base font-extrabold text-primary" : "font-semibold text-slate-900"}`}>{v}</span>
    </div>
  );
}
function PayRow({ dot, label, sub, v, strong }: { dot: string; label: string; sub: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ${strong ? "bg-primary/10" : ""}`}>
      <span className="flex items-center gap-2.5"><span className={`h-2.5 w-2.5 rounded-full ${dot}`} /><span><span className="block font-semibold text-slate-800">{label}</span><span className="block text-xs text-slate-500">{sub}</span></span></span>
      <span className={`font-mono ${strong ? "text-lg font-extrabold text-primary" : "font-bold text-slate-900"}`}>{v}</span>
    </div>
  );
}
