import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { UPI_PENDING_KEY, verifyUpiOrder, type BookingReceipt } from "@/lib/booking";

// Landing page after the UPI Gateway checkout (redirect_url = <site>/booking/return).
// The query string is only a HINT of which order to look at — success is decided solely by the server
// re-reading the order from the gateway (verify-payment), never by `?status=paid`.

const ORDER_RE = /^[A-Za-z0-9_-]{6,64}$/;
const POLL_MS = 3000;
const MAX_POLLS = 40; // ~2 minutes

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function findOrderId(): string | null {
  const q = new URLSearchParams(window.location.search).get("order_id");
  if (q && ORDER_RE.test(q)) return q;
  try {
    const saved = JSON.parse(localStorage.getItem(UPI_PENDING_KEY) ?? "null") as { orderId?: string } | null;
    if (saved?.orderId && ORDER_RE.test(saved.orderId)) return saved.orderId;
  } catch { /* ignore */ }
  return null;
}

type View = { k: "checking" } | { k: "ok"; r: BookingReceipt } | { k: "slow" } | { k: "failed"; msg: string };

export default function BookingReturn() {
  const [view, setView] = useState<View>({ k: "checking" });
  const [orderId] = useState(findOrderId);
  const stop = useRef(false);

  useEffect(() => {
    document.title = "Confirming your payment — Nikhil Paharia";
    if (!orderId) {
      setView({ k: "failed", msg: "We couldn't find a payment to confirm. If you paid, your booking is confirmed automatically — or contact me." });
      return;
    }
    stop.current = false;
    (async () => {
      for (let i = 0; i < MAX_POLLS && !stop.current; i++) {
        try {
          const r = await verifyUpiOrder(orderId);
          if (r.receipt) {
            try { localStorage.removeItem(UPI_PENDING_KEY); } catch { /* ignore */ }
            setView({ k: "ok", r: r.receipt });
            return;
          }
          if (!r.pending) { setView({ k: "failed", msg: r.error ?? "Payment was not completed." }); return; }
        } catch { /* network blip — keep polling */ }
        await new Promise((res) => setTimeout(res, POLL_MS));
      }
      if (!stop.current) setView({ k: "slow" });
    })();
    return () => { stop.current = true; };
  }, [orderId]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white/90 p-8 text-center shadow-xl">
        {view.k === "checking" && (
          <div role="status" className="space-y-3">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h1 className="text-xl font-extrabold text-slate-900">Confirming your payment…</h1>
            <p className="text-sm text-slate-500">This takes a few seconds. Please don't close this page or pay again.</p>
          </div>
        )}
        {view.k === "ok" && (
          <div className="space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="text-xl font-extrabold text-slate-900">Your booking is confirmed.</h1>
            <p className="inline-block rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">Ref {view.r.ref}</p>
            <dl className="space-y-1 rounded-2xl border border-slate-200/70 p-4 text-left text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Service</dt><dd className="font-semibold">{view.r.service}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Booking token paid ✓</dt><dd className="font-bold">{inr(view.r.token)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Due at project start</dt><dd>{inr(view.r.startAdvance)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Due after completion</dt><dd>{inr(view.r.remaining)}</dd></div>
            </dl>
            <Link href="/" className="inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white">Back to home</Link>
          </div>
        )}
        {view.k === "slow" && (
          <div className="space-y-3">
            <Loader2 className="mx-auto h-10 w-10 text-primary" />
            <h1 className="text-xl font-extrabold text-slate-900">Still waiting for your bank</h1>
            <p className="text-sm text-slate-500">If you've paid, your booking is confirmed automatically as soon as it clears and you'll get an email. Please don't pay again — or contact me.</p>
            <Link href="/" className="inline-block text-sm font-bold text-primary">Back to home</Link>
          </div>
        )}
        {view.k === "failed" && (
          <div className="space-y-3">
            <XCircle className="mx-auto h-12 w-12 text-rose-500" />
            <h1 className="text-xl font-extrabold text-slate-900">Payment not confirmed</h1>
            <p className="text-sm text-slate-500">{view.msg}</p>
            <Link href="/" className="inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white">Back to home</Link>
          </div>
        )}
      </div>
    </main>
  );
}
