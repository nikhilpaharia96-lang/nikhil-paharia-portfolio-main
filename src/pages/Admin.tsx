import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, LogOut, MessageCircle, RefreshCw, Search, Lock, Phone, Mail, Building2, CalendarDays, IndianRupee } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  BOOKING_STATUSES, STATUS_LABELS, MILESTONE_LABELS, buildWhatsAppLink, bookingRef, type Booking, type BookingStatus,
} from "../../shared/booking";
import { formatINR } from "../../shared/servicePricing";

interface Stats { totalLeads: number; newInquiries: number; confirmedBookings: number; pendingPayments: number; revenue: number; tokenRevenue: number; outstanding: number }

async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, body === undefined ? { credentials: "same-origin" } : { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Request failed"), { status: res.status });
  return data as T;
}

const STATUS_STYLE: Record<BookingStatus, string> = {
  new_lead: "bg-sky-100 text-sky-700", contacted: "bg-indigo-100 text-indigo-700", discussion: "bg-violet-100 text-violet-700",
  booking_confirmed: "bg-emerald-100 text-emerald-700", project_started: "bg-blue-100 text-blue-700", completed: "bg-slate-200 text-slate-700", cancelled: "bg-rose-100 text-rose-700",
};
const PAY_STYLE = { paid: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700", failed: "bg-rose-100 text-rose-700" } as const;
const PAY_LABEL = { paid: "Token paid", pending: "Payment pending", failed: "Payment failed" } as const;
const fmtDate = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const paidSum = (b: Booking) => b.payments.reduce((s, p) => s + p.amount, 0);

export default function Admin() {
  const qc = useQueryClient();
  useEffect(() => {
    const prev = document.title;
    document.title = "Admin — Nikhil Paharia";
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => { document.title = prev; m.remove(); };
  }, []);

  const session = useQuery({ queryKey: ["admin", "session"], queryFn: () => api<{ authenticated: boolean; configured: boolean }>("session"), retry: false });

  if (session.isLoading) return <Shell><Loader2 className="mx-auto mt-40 h-8 w-8 animate-spin text-primary" /></Shell>;
  if (!session.data?.authenticated) {
    return <Shell><Login configured={session.data?.configured ?? true} onDone={() => qc.invalidateQueries({ queryKey: ["admin"] })} /></Shell>;
  }
  return <Shell wide><Dashboard onLogout={async () => { await api("logout", {}); qc.clear(); qc.invalidateQueries({ queryKey: ["admin"] }); }} /></Shell>;
}

function Shell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50/60 px-4 py-8">
      <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-sm"}`}>{children}</div>
    </div>
  );
}

function Login({ configured, onDone }: { configured: boolean; onDone: () => void }) {
  const [pw, setPw] = useState("");
  const m = useMutation({ mutationFn: () => api("login", { password: pw }), onSuccess: onDone, onError: (e: Error) => toast.error(e.message) });
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (pw) m.mutate(); }} className="mt-24 rounded-3xl border border-white/60 bg-white/70 p-7 shadow-xl backdrop-blur-xl">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Lock className="h-6 w-6" /></span>
      <h1 className="font-serif text-2xl font-black uppercase text-slate-900">Admin</h1>
      <p className="mt-1 text-sm text-slate-500">{configured ? "Authorised access only." : "Admin access isn't configured yet (set ADMIN_PASSWORD and ADMIN_SESSION_SECRET)."}</p>
      <input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} disabled={!configured} placeholder="Password" className="mt-5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
      <button disabled={!configured || !pw || m.isPending} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white disabled:opacity-50">
        {m.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
      </button>
    </form>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const data = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => api<{ bookings: Booking[]; stats: Stats }>("bookings"),
    refetchInterval: 60_000,
    retry: false,
  });
  useEffect(() => {
    if ((data.error as { status?: number } | null)?.status === 401) qc.invalidateQueries({ queryKey: ["admin", "session"] });
  }, [data.error, qc]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (data.data?.bookings ?? []).filter((b) =>
      (statusFilter === "all" || b.status === statusFilter) &&
      (!t || [b.name, b.email, b.phone, b.company, b.serviceTitle, bookingRef(b.id)].join(" ").toLowerCase().includes(t)));
  }, [data.data, q, statusFilter]);
  const open = data.data?.bookings.find((b) => b.id === openId) ?? null;
  const s = data.data?.stats;

  return (
    <>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-black uppercase text-slate-900 sm:text-3xl">Client leads</h1>
          <p className="text-sm text-slate-500">Bookings, payments and conversations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => data.refetch()} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"><RefreshCw className={`h-4 w-4 ${data.isFetching ? "animate-spin" : ""}`} />Refresh</button>
          <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </header>

      {data.isLoading && <Loader2 className="mx-auto mt-20 h-8 w-8 animate-spin text-primary" />}
      {data.isError && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{(data.error as Error).message}</p>}

      {s && (
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Stat label="Total leads" value={String(s.totalLeads)} />
          <Stat label="New inquiries" value={String(s.newInquiries)} />
          <Stat label="Confirmed bookings" value={String(s.confirmedBookings)} accent />
          <Stat label="Pending payments" value={String(s.pendingPayments)} />
          <Stat label="Booking revenue" value={formatINR(s.revenue)} sub={`Token ${formatINR(s.tokenRevenue)}`} accent />
          <Stat label="Balance to collect" value={formatINR(s.outstanding)} />
        </section>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, email, service, ref…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | BookingStatus)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold">
          <option value="all">All statuses</option>
          {BOOKING_STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {list.map((b) => (
          <article key={b.id} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
            <button className="block w-full text-left" onClick={() => setOpenId(b.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-slate-900">{b.name}</h2>
                  <p className="truncate text-sm text-slate-500">{b.serviceTitle}{b.company ? ` · ${b.company}` : ""}</p>
                </div>
                <span className="shrink-0 font-mono text-sm font-extrabold text-primary">{formatINR(b.budget)}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className={`rounded-full px-2.5 py-1 ${STATUS_STYLE[b.status]}`}>{STATUS_LABELS[b.status]}</span>
                <span className={`rounded-full px-2.5 py-1 ${PAY_STYLE[b.paymentStatus]}`}>{PAY_LABEL[b.paymentStatus]}</span>
                <span className="ml-auto font-medium text-slate-400">{fmtDate(b.createdAt)}</span>
              </div>
            </button>
            <div className="mt-3 flex gap-2">
              <a href={buildWhatsAppLink(b)} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] py-2 text-sm font-bold text-white"><MessageCircle className="h-4 w-4" />WhatsApp</a>
              <button onClick={() => setOpenId(b.id)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">Details</button>
            </div>
          </article>
        ))}
      </div>
      {!data.isLoading && !list.length && <p className="py-16 text-center text-sm text-slate-500">No leads match.</p>}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">{open && <Detail key={open.id} b={open} />}</SheetContent>
      </Sheet>
    </>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 backdrop-blur ${accent ? "border-primary/20 bg-primary/10" : "border-white/70 bg-white/80"}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-extrabold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function Detail({ b }: { b: Booking }) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState(b.notes);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
  const update = useMutation({ mutationFn: (patch: { status?: string; notes?: string }) => api("update", { id: b.id, ...patch }), onSuccess: () => { toast.success("Saved"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const record = useMutation({ mutationFn: (milestone: "advance" | "final") => api("record-payment", { id: b.id, milestone }), onSuccess: () => { toast.success("Payment recorded"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const has = (m: string) => b.payments.some((p) => p.milestone === m);
  const outstanding = b.quote.total - paidSum(b);

  return (
    <>
      <SheetHeader className="text-left">
        <SheetTitle className="font-serif text-xl font-black uppercase">{b.name}</SheetTitle>
        <SheetDescription>{b.serviceTitle} · Ref {bookingRef(b.id)}</SheetDescription>
      </SheetHeader>
      <div className="mt-5 space-y-5 text-sm">
        <a href={buildWhatsAppLink(b)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 font-bold text-white"><MessageCircle className="h-5 w-5" />Message on WhatsApp</a>

        <Block title="Status">
          <select value={b.status} onChange={(e) => update.mutate({ status: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-semibold">
            {BOOKING_STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
          </select>
        </Block>

        <Block title="Client">
          <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /><a className="font-semibold" href={`tel:+91${b.phone}`}>+91 {b.phone}</a></p>
          <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /><a className="break-all font-semibold" href={`mailto:${b.email}`}>{b.email}</a></p>
          {b.company && <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" />{b.company}</p>}
        </Block>

        <Block title="Project">
          <p className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-slate-400" />Budget <b className="font-mono">{formatINR(b.budget)}</b></p>
          {b.websiteType && <p>Type: <b>{b.websiteType}</b></p>}
          {b.startDate && <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-400" />Start: <b>{b.startDate}</b></p>}
          <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-slate-700">{b.description}</p>
        </Block>

        <Block title="Payment schedule">
          <Milestone label={`${b.quote.tokenPercent}% Booking token`} amount={b.quote.token} done={has("token")} />
          <Milestone label={`${b.quote.startPercent}% Project-start advance`} amount={b.quote.startAdvance} done={has("advance")} action={b.paymentStatus === "paid" && !has("advance") ? () => record.mutate("advance") : undefined} busy={record.isPending} />
          <Milestone label={`${b.quote.remainingPercent}% Final payment`} amount={b.quote.remaining} done={has("final")} action={b.paymentStatus === "paid" && !has("final") && outstanding > 0 ? () => record.mutate("final") : undefined} busy={record.isPending} />
          <p className="pt-1 text-xs text-slate-500">"Mark received" records a UPI / bank payment you collected yourself.</p>
        </Block>

        <Block title="Payment history">
          {!b.payments.length && <p className="text-slate-500">No payments received yet.</p>}
          {b.payments.map((p) => (
            <div key={p.id} className="rounded-xl bg-slate-50 p-3">
              <div className="flex justify-between"><b>{MILESTONE_LABELS[p.milestone]}</b><b className="font-mono text-emerald-700">{formatINR(p.amount)}</b></div>
              <p className="text-xs text-slate-500">{fmtDate(p.at)} · {p.method === "razorpay" ? "Razorpay (verified)" : "Manual"}{p.razorpayPaymentId ? ` · ${p.razorpayPaymentId}` : ""}</p>
              {p.note && <p className="mt-1 text-xs font-semibold text-amber-700">{p.note}</p>}
            </div>
          ))}
          {b.failures.map((f, i) => <p key={i} className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">Failed {fmtDate(f.at)} — {f.reason}</p>)}
        </Block>

        <Block title="Private notes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={4000} className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" placeholder="Call notes, requirements, next steps…" />
          <button disabled={notes === b.notes || update.isPending} onClick={() => update.mutate({ notes })} className="rounded-full bg-primary px-5 py-2 font-bold text-white disabled:opacity-40">Save notes</button>
        </Block>

        <Block title="Timeline">
          {b.statusHistory.map((h, i) => <p key={i} className="text-xs text-slate-500">{fmtDate(h.at)} — <b className="text-slate-700">{STATUS_LABELS[h.status]}</b></p>)}
        </Block>
      </div>
    </>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-2"><h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{title}</h3>{children}</section>;
}
function Milestone({ label, amount, done, action, busy }: { label: string; amount: number; done: boolean; action?: () => void; busy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3">
      <div><p className="font-semibold text-slate-800">{label}</p><p className="font-mono text-xs text-slate-500">{formatINR(amount)}</p></div>
      {done ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Received ✓</span>
        : action ? <button disabled={busy} onClick={action} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary disabled:opacity-50">Mark received</button>
        : <span className="text-xs font-semibold text-slate-400">Pending</span>}
    </div>
  );
}
