import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, ShieldCheck, AlertTriangle, ArrowLeft, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { payBookingToken, PaymentError, type BookingReceipt } from "@/lib/booking";
import { formatINR, type Quote, type ServiceSlug } from "../../../shared/servicePricing";

type Step = "details" | "review" | "paying" | "success" | "failed";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: ServiceSlug;
  serviceTitle: string;
  quote: Quote;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fieldCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

export default function BookingDialog({ open, onOpenChange, slug, serviceTitle, quote }: Props) {
  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState({ name: "", email: "", phone: "", requirements: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);

  // Start fresh each time the dialog opens (but never while a payment is in flight).
  useEffect(() => {
    if (open && step !== "paying" && step !== "success") {
      setStep("details");
      setErrors({});
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  const phoneDigits = form.phone.replace(/\D/g, "").slice(-10);

  const validate = () => {
    const er: Record<string, string> = {};
    if (!form.name.trim()) er.name = "Please enter your name";
    if (!EMAIL_RE.test(form.email.trim())) er.email = "Enter a valid email address";
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) er.phone = "Enter a valid 10-digit mobile number";
    if (form.requirements.trim().length < 10) er.requirements = "Tell me a little about what you need (min 10 characters)";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const toReview = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) setStep("review");
  };

  const pay = async () => {
    setStep("paying");
    setError("");
    try {
      const r = await payBookingToken({
        service: slug,
        total: quote.total,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: phoneDigits,
        requirements: form.requirements.trim(),
      });
      setReceipt(r);
      setStep("success");
    } catch (err) {
      const cancelled = err instanceof PaymentError && err.cancelled;
      setError(cancelled ? "Payment was not completed. You haven't been charged." : err instanceof Error ? err.message : "Something went wrong.");
      setStep("failed");
    }
  };

  const busy = step === "paying";

  return (
    <Dialog open={open} onOpenChange={(o) => (!busy ? onOpenChange(o) : undefined)}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-24px)] max-w-lg overflow-y-auto rounded-3xl border-0 bg-white p-0 shadow-2xl [&>button]:z-10 [&>button]:text-white [&>button]:opacity-80">
        <div className="bg-slate-900 px-6 pb-5 pt-7 text-white sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">Book this service</p>
          <DialogTitle className="mt-1 font-serif text-xl font-black uppercase tracking-tight sm:text-2xl">{serviceTitle}</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-slate-300">
            {step === "success" ? "Your booking is confirmed." : "Share your details, review the quotation, then pay the booking token securely."}
          </DialogDescription>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {step === "details" && (
            <form onSubmit={toReview} noValidate className="space-y-4">
              <Field label="Full name" error={errors.name}>
                <input className={fieldCls} value={form.name} onChange={set("name")} autoComplete="name" placeholder="Your name" maxLength={100} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" error={errors.email}>
                  <input className={fieldCls} type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input className={fieldCls} type="tel" inputMode="numeric" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="10-digit mobile" />
                </Field>
              </div>
              <Field label="Project requirements" error={errors.requirements}>
                <textarea className={`${fieldCls} min-h-[110px] resize-y`} value={form.requirements} onChange={set("requirements")} placeholder="What do you want built / made? Any deadlines, references or links?" maxLength={2000} />
              </Field>
              <button type="submit" className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:brightness-110 active:scale-[0.99]">
                Review quotation →
              </button>
            </form>
          )}

          {step === "review" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <Row k="Name" v={form.name.trim()} />
                <Row k="Email" v={form.email.trim()} />
                <Row k="Phone" v={phoneDigits} />
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm">
                <Row k="Total project cost" v={formatINR(quote.total)} />
                <Row k={`Booking token — pay now (${quote.tokenPercent}%)`} v={formatINR(quote.token)} strong />
                <Row k={`Additional advance at project start (${quote.startPercent}%)`} v={formatINR(quote.startAdvance)} />
                <Row k={`Remaining after completion (${quote.remainingPercent}%)`} v={formatINR(quote.remaining)} />
              </div>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                You pay only the booking token now through a secure payment gateway. The additional advance is due when the project starts, and the balance after the work is completed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep("details")} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                  <ArrowLeft className="h-4 w-4" /> Edit
                </button>
                <button onClick={pay} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:brightness-110 active:scale-[0.99]">
                  <Lock className="h-4 w-4" /> Pay {formatINR(quote.token)} booking token
                </button>
              </div>
            </div>
          )}

          {step === "paying" && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
              <p className="font-semibold text-slate-800">Waiting for payment…</p>
              <p className="max-w-xs text-sm text-slate-500">Complete the payment in the secure window. Please don't close this page.</p>
            </div>
          )}

          {step === "success" && receipt && (
            <div className="space-y-5 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
              <div>
                <h3 className="font-serif text-2xl font-black text-slate-900">Booking confirmed</h3>
                <p className="mt-1 text-sm text-slate-600">Thank you, {form.name.trim()}! I've received your booking token and will contact you shortly on {form.email.trim()}.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm">
                <Row k="Service" v={receipt.service} />
                <Row k="Total project cost" v={formatINR(receipt.total)} />
                <Row k="Booking token paid" v={formatINR(receipt.token)} strong />
                <Row k="Due at project start" v={formatINR(receipt.startAdvance)} />
                <Row k="Due after completion" v={formatINR(receipt.remaining)} />
                <Row k="Payment ID" v={receipt.paymentId} />
              </div>
              <button onClick={() => onOpenChange(false)} className="w-full rounded-full bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800">Done</button>
            </div>
          )}

          {step === "failed" && (
            <div className="space-y-5 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
              <div>
                <h3 className="font-serif text-xl font-black text-slate-900">Payment not completed</h3>
                <p className="mt-1 text-sm text-slate-600">{error}</p>
                <p className="mt-2 text-xs text-slate-400">If money was deducted, it will be refunded automatically — or contact me and I'll sort it out.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("review")} className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-white transition hover:brightness-110">Try again</button>
                <button onClick={() => onOpenChange(false)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Close</button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-slate-500">{k}</span>
      <span className={`text-right ${strong ? "text-base font-extrabold text-primary" : "font-semibold text-slate-900"}`}>{v}</span>
    </div>
  );
}
