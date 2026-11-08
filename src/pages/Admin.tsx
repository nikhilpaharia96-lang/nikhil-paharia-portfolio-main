import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2, LogOut, MessageCircle, RefreshCw, Search, Lock, Phone, Mail, Building2, CalendarDays, IndianRupee,
  Download, Copy, Eye, EyeOff, Trash2, Send, BellRing, TrendingUp,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  BOOKING_STATUSES, STATUS_LABELS, MILESTONE_LABELS, WA_TEMPLATES, WA_TEMPLATE_LABELS, buildWhatsAppLink, bookingRef, istToday,
  type AdminStats, type Booking, type BookingStatus, type WaTemplate,
} from "../../shared/booking";
import { SERVICE_PRICES, SERVICE_SLUGS, formatINR } from "../../shared/servicePricing";

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
const shortDay = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const paidSum = (b: Booking) => b.payments.reduce((s, p) => s + p.amount, 0);
const isOpen = (b: Booking) => b.status !== "completed" && b.status !== "cancelled";
const isDue = (b: Booking) => !!b.followUpAt && b.followUpAt <= istToday() && isOpen(b);
const isFresh = (b: Booking) => Date.now() - Date.parse(b.createdAt) < 24 * 3600 * 1000 && b.status === "new_lead";
const addDays = (n: number) => istToday(Date.now() + n * 86_400_000);
const PAGE = 30;

type Sort = "newest" | "oldest" | "budget" | "followup";
type Filters = { q: string; status: "all" | BookingStatus; pay: "all" | Booking["paymentStatus"]; service: string; due: boolean; sort: Sort };
const DEFAULT_FILTERS: Filters = { q: "", status: "all", pay: "all", service: "all", due: false, sort: "newest" };

/** CSV cell: quoted, and neutralised against spreadsheet formula injection (=, +, -, @ at the start). */
const csvCell = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};
function exportCsv(rows: Booking[]) {
  const head = ["Ref", "Created", "Type", "Source", "Name", "WhatsApp", "Email", "Company", "Service", "Website type", "Budget", "Status", "Payment", "Received", "Balance", "Preferred start", "Follow-up", "Description", "Notes"];
  const lines = rows.map((b) => [
    bookingRef(b.id), b.createdAt, b.inquiry && b.paymentStatus !== "paid" ? "Enquiry" : "Booking", b.source || "direct", b.name, `91${b.phone}`, b.email, b.company, b.serviceTitle, b.websiteType, b.budget,
    STATUS_LABELS[b.status], PAY_LABEL[b.paymentStatus], paidSum(b), Math.max(0, b.quote.total - paidSum(b)), b.startDate, b.followUpAt ?? "", b.description, b.notes,
  ].map(csvCell).join(","));
  const blob = new Blob(["\uFEFF" + [head.map(csvCell).join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `leads-${istToday()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Admin() {
  const qc = useQueryClient();
  useEffect(() => {
    const prev = document.title;
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
  const [show, setShow] = useState(false);
  const m = useMutation({ mutationFn: () => api("login", { password: pw }), onSuccess: onDone, onError: (e: Error) => { toast.error(e.message); setPw(""); } });
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (pw) m.mutate(); }} className="mt-24 rounded-3xl border border-white/60 bg-white/70 p-7 shadow-xl backdrop-blur-xl">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Lock className="h-6 w-6" /></span>
      <h1 className="font-serif text-2xl font-black uppercase text-slate-900">Admin</h1>
      <p className="mt-1 text-sm text-slate-500">{configured ? "Authorised access only." : "Admin access isn't configured yet (set ADMIN_PASSWORD and ADMIN_SESSION_SECRET)."}</p>
      <div className="relative mt-5">
        <input type={show ? "text" : "password"} autoFocus autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} disabled={!configured} placeholder="Password" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-11 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
      </div>
      <button disabled={!configured || !pw || m.isPending} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white disabled:opacity-50">
        {m.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
      </button>
    </form>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState<Filters>(DEFAULT_FILTERS);
  const [shown, setShown] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [insights, setInsights] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768);
  const patch = (p: Partial<Filters>) => { setF((x) => ({ ...x, ...p })); setShown(PAGE); };

  const data = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => api<{ bookings: Booking[]; stats: AdminStats }>("bookings"),
    refetchInterval: 60_000,
    retry: false,
  });
  useEffect(() => {
    if ((data.error as { status?: number } | null)?.status === 401) qc.invalidateQueries({ queryKey: ["admin", "session"] });
  }, [data.error, qc]);

  const s = data.data?.stats;
  useEffect(() => { document.title = `${s?.newInquiries ? `(${s.newInquiries}) ` : ""}Admin — Nikhil Paharia`; }, [s?.newInquiries]);

  const quickStatus = useMutation({
    mutationFn: (v: { id: string; status: string }) => api("update", v),
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["admin", "bookings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const list = useMemo(() => {
    const t = f.q.trim().toLowerCase();
    const rows = (data.data?.bookings ?? []).filter((b) =>
      (f.status === "all" || b.status === f.status) &&
      (f.pay === "all" || b.paymentStatus === f.pay) &&
      (f.service === "all" || b.service === f.service) &&
      (!f.due || isDue(b)) &&
      (!t || [b.name, b.email, b.phone, b.company, b.serviceTitle, b.source ?? "", bookingRef(b.id)].join(" ").toLowerCase().includes(t)));
    const by: Record<Sort, (a: Booking, b: Booking) => number> = {
      newest: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      oldest: (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
      budget: (a, b) => b.budget - a.budget,
      followup: (a, b) => (a.followUpAt || "9999").localeCompare(b.followUpAt || "9999"),
    };
    return rows.sort(by[f.sort]);
  }, [data.data, f]);

  const open = data.data?.bookings.find((b) => b.id === openId) ?? null;
  const filtered = JSON.stringify(f) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-black uppercase text-slate-900 sm:text-3xl">Client leads</h1>
          <p className="text-sm text-slate-500">Bookings, payments and conversations{data.dataUpdatedAt ? ` · updated ${new Date(data.dataUpdatedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => data.refetch()} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"><RefreshCw className={`h-4 w-4 ${data.isFetching ? "animate-spin" : ""}`} />Refresh</button>
          <button onClick={() => exportCsv(list)} disabled={!list.length} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-40"><Download className="h-4 w-4" />CSV ({list.length})</button>
          <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </header>

      {data.isLoading && <Loader2 className="mx-auto mt-20 h-8 w-8 animate-spin text-primary" />}
      {data.isError && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{(data.error as Error).message}</p>}

      {s && (
        <>
          <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Total leads" value={String(s.totalLeads)} />
            <Stat label="New inquiries" value={String(s.newInquiries)} onClick={() => patch({ status: "new_lead" })} />
            <Stat label="Confirmed bookings" value={String(s.confirmedBookings)} accent onClick={() => patch({ pay: "paid" })} />
            <Stat label="Pending payments" value={String(s.pendingPayments)} onClick={() => patch({ pay: "pending" })} />
            <Stat label="Booking revenue" value={formatINR(s.revenue)} sub={`Token ${formatINR(s.tokenRevenue)}`} accent />
            <Stat label="Balance to collect" value={formatINR(s.outstanding)} />
            <Stat label="Conversion" value={`${s.conversionRate}%`} sub="leads → paid" />
            <Stat label="Follow-ups due" value={String(s.followUpsDue)} alert={s.followUpsDue > 0} onClick={() => patch({ due: true, sort: "followup" })} />
          </section>

          <section className="mb-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {BOOKING_STATUSES.map((st) => (
              <button key={st} onClick={() => patch({ status: f.status === st ? "all" : st })} className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${f.status === st ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-600"}`}>
                {STATUS_LABELS[st]}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${f.status === st ? "bg-white/25" : "bg-slate-100"}`}>{s.byStatus[st]}</span>
              </button>
            ))}
          </section>

          <section className="mb-6 rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur">
            <button onClick={() => setInsights((v) => !v)} className="flex w-full items-center justify-between text-left">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary"><TrendingUp className="h-4 w-4" />Insights · last 14 days</span>
              <span className="text-xs font-semibold text-slate-400">{insights ? "Hide" : "Show"}</span>
            </button>
            {insights && (
              <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Bars title="New leads per day" data={s.daily.map((d) => ({ label: shortDay(d.date), v: d.leads }))} color="bg-sky-400" fmt={(n) => String(n)} />
                <Bars title="Revenue per day" data={s.daily.map((d) => ({ label: shortDay(d.date), v: d.revenue }))} color="bg-emerald-500" fmt={formatINR} />
                <div>
                  <h3 className="mb-2 text-xs font-bold text-slate-500">By service (all time)</h3>
                  <div className="space-y-2">
                    {s.byService.slice(0, 6).map((r) => {
                      const max = Math.max(1, ...s.byService.map((x) => x.leads));
                      return (
                        <div key={r.service}>
                          <div className="flex justify-between text-xs"><span className="truncate font-semibold text-slate-700">{r.title}</span><span className="shrink-0 pl-2 font-mono text-slate-500">{r.confirmed}/{r.leads} · {formatINR(r.revenue)}</span></div>
                          <div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${(r.leads / max) * 100}%` }} /></div>
                        </div>
                      );
                    })}
                    {!s.byService.length && <p className="text-xs text-slate-400">No data yet.</p>}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-xs font-bold text-slate-500">By source (leads → paid)</h3>
                  <div className="space-y-2">
                    {s.bySource.slice(0, 6).map((r) => (
                      <button key={r.source} onClick={() => patch({ q: r.source === "direct" ? "" : r.source })} className="block w-full text-left">
                        <div className="flex justify-between text-xs"><span className="truncate font-semibold text-slate-700" title={r.source}>{r.source}</span><span className="shrink-0 pl-2 font-mono text-slate-500">{r.leads} → {r.confirmed} · {formatINR(r.revenue)}</span></div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${r.leads ? (r.confirmed / r.leads) * 100 : 0}%` }} /></div>
                      </button>
                    ))}
                    {!s.bySource.length && <p className="text-xs text-slate-400">No data yet.</p>}
                    <p className="text-[10px] text-slate-400">Tracked from utm_* links and referrers. Tap a source to filter.</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={f.q} onChange={(e) => patch({ q: e.target.value })} placeholder="Search name, phone, email, ref…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
        </div>
        <Sel value={f.status} onChange={(v) => patch({ status: v as Filters["status"] })}><option value="all">All statuses</option>{BOOKING_STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}</Sel>
        <Sel value={f.pay} onChange={(v) => patch({ pay: v as Filters["pay"] })}><option value="all">Any payment</option><option value="paid">Token paid</option><option value="pending">Payment pending</option><option value="failed">Payment failed</option></Sel>
        <Sel value={f.service} onChange={(v) => patch({ service: v })}><option value="all">All services</option>{SERVICE_SLUGS.map((sl) => <option key={sl} value={sl}>{SERVICE_PRICES[sl].title}</option>)}</Sel>
        <Sel value={f.sort} onChange={(v) => patch({ sort: v as Sort })}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="budget">Highest budget</option><option value="followup">Follow-up soonest</option></Sel>
      </div>
      {(filtered || f.due) && (
        <p className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {list.length} of {data.data?.bookings.length ?? 0} leads{f.due && <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">Follow-up due</span>}
          <button onClick={() => { setF(DEFAULT_FILTERS); setShown(PAGE); }} className="font-bold text-primary underline-offset-2 hover:underline">Clear filters</button>
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {list.slice(0, shown).map((b) => (
          <article key={b.id} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
            <button className="block w-full text-left" onClick={() => setOpenId(b.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 truncate font-bold text-slate-900">{b.name}{isFresh(b) && <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">New</span>}</h2>
                  <p className="truncate text-sm text-slate-500">{b.serviceTitle}{b.company ? ` · ${b.company}` : ""}</p>
                </div>
                <span className="shrink-0 font-mono text-sm font-extrabold text-primary">{formatINR(b.budget)}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className={`rounded-full px-2.5 py-1 ${STATUS_STYLE[b.status]}`}>{STATUS_LABELS[b.status]}</span>
                {b.inquiry && b.paymentStatus !== "paid"
                  ? <span className="rounded-full bg-violet-100 px-2.5 py-1 text-violet-700">Enquiry · no payment</span>
                  : <span className={`rounded-full px-2.5 py-1 ${PAY_STYLE[b.paymentStatus]}`}>{PAY_LABEL[b.paymentStatus]}</span>}
                {b.source && <span className="max-w-[11rem] truncate rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600" title={b.source}>{b.source}</span>}
                {b.followUpAt && isOpen(b) && <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${isDue(b) ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}><BellRing className="h-3 w-3" />{b.followUpAt === istToday() ? "Today" : shortDay(b.followUpAt)}</span>}
                <span className="ml-auto font-medium text-slate-400">{fmtDate(b.createdAt)}</span>
              </div>
            </button>
            <div className="mt-3 flex gap-2">
              <a href={buildWhatsAppLink(b)} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] py-2 text-sm font-bold text-white"><MessageCircle className="h-4 w-4" />WhatsApp</a>
              <a href={`tel:+91${b.phone}`} aria-label={`Call ${b.name}`} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3.5 text-slate-700"><Phone className="h-4 w-4" /></a>
              <select aria-label="Change status" value={b.status} disabled={quickStatus.isPending} onChange={(e) => quickStatus.mutate({ id: b.id, status: e.target.value })} className="max-w-[9.5rem] rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                {BOOKING_STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
              </select>
              <button onClick={() => setOpenId(b.id)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">Details</button>
            </div>
          </article>
        ))}
      </div>
      {list.length > shown && <button onClick={() => setShown((n) => n + PAGE)} className="mx-auto mt-5 block rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700">Show more ({list.length - shown} left)</button>}
      {!data.isLoading && !list.length && <p className="py-16 text-center text-sm text-slate-500">No leads match.</p>}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">{open && <Detail key={open.id} b={open} onGone={() => setOpenId(null)} />}</SheetContent>
      </Sheet>
    </>
  );
}

function Sel({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: ReactNode }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">{children}</select>;
}

function Stat({ label, value, sub, accent, alert, onClick }: { label: string; value: string; sub?: string; accent?: boolean; alert?: boolean; onClick?: () => void }) {
  const cls = `rounded-2xl border p-4 text-left backdrop-blur ${alert ? "border-rose-200 bg-rose-50" : accent ? "border-primary/20 bg-primary/10" : "border-white/70 bg-white/80"}`;
  const body = (<><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className={`mt-1 font-mono text-xl font-extrabold ${alert ? "text-rose-700" : "text-slate-900"}`}>{value}</p>{sub && <p className="text-xs text-slate-500">{sub}</p>}</>);
  return onClick ? <button onClick={onClick} className={`${cls} transition hover:-translate-y-0.5 hover:shadow-md`}>{body}</button> : <div className={cls}>{body}</div>;
}

function Bars({ title, data, color, fmt }: { title: string; data: { label: string; v: number }[]; color: string; fmt: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.v));
  const total = data.reduce((s, d) => s + d.v, 0);
  return (
    <div>
      <h3 className="mb-2 text-xs font-bold text-slate-500">{title} <span className="font-mono text-slate-800">· {fmt(total)}</span></h3>
      <div className="flex h-24 items-end gap-1" role="img" aria-label={`${title}: total ${fmt(total)}`}>
        {data.map((d) => <div key={d.label} title={`${d.label}: ${fmt(d.v)}`} className={`flex-1 rounded-t ${d.v ? color : "bg-slate-100"}`} style={{ height: `${Math.max(d.v ? 8 : 3, (d.v / max) * 100)}%` }} />)}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400"><span>{data[0]?.label}</span><span>{data.at(-1)?.label}</span></div>
    </div>
  );
}

function Detail({ b, onGone }: { b: Booking; onGone: () => void }) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState(b.notes);
  const [tmpl, setTmpl] = useState<WaTemplate>("auto");
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
  const update = useMutation({ mutationFn: (patch: { status?: string; notes?: string; followUpAt?: string }) => api("update", { id: b.id, ...patch }), onSuccess: () => { toast.success("Saved"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const record = useMutation({ mutationFn: (milestone: "advance" | "final") => api("record-payment", { id: b.id, milestone }), onSuccess: () => { toast.success("Payment recorded"); refresh(); }, onError: (e: Error) => toast.error(e.message) });
  const resend = useMutation({ mutationFn: () => api("resend", { id: b.id }), onSuccess: () => toast.success("Confirmation re-sent to the client"), onError: (e: Error) => toast.error(e.message) });
  const del = useMutation({ mutationFn: () => api("delete", { id: b.id }), onSuccess: () => { toast.success("Lead deleted"); refresh(); onGone(); }, onError: (e: Error) => toast.error(e.message) });
  const has = (m: string) => b.payments.some((p) => p.milestone === m);
  const outstanding = b.quote.total - paidSum(b);
  const copy = (text: string, what: string) => navigator.clipboard.writeText(text).then(() => toast.success(`${what} copied`), () => toast.error("Couldn't copy"));

  return (
    <>
      <SheetHeader className="text-left">
        <SheetTitle className="font-serif text-xl font-black uppercase">{b.name}</SheetTitle>
        <SheetDescription>{b.serviceTitle} · Ref {bookingRef(b.id)}</SheetDescription>
      </SheetHeader>
      <div className="mt-5 space-y-5 text-sm">
        <Block title="WhatsApp">
          <select value={tmpl} onChange={(e) => setTmpl(e.target.value as WaTemplate)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-semibold">
            {WA_TEMPLATES.map((t) => <option key={t} value={t}>{WA_TEMPLATE_LABELS[t]}</option>)}
          </select>
          <a href={buildWhatsAppLink(b, tmpl)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 font-bold text-white"><MessageCircle className="h-5 w-5" />Open in WhatsApp</a>
        </Block>

        <Block title="Status">
          <select value={b.status} onChange={(e) => update.mutate({ status: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-semibold">
            {BOOKING_STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
          </select>
        </Block>

        <Block title="Next follow-up">
          <div className="flex gap-2">
            <input type="date" min={istToday()} value={b.followUpAt ?? ""} onChange={(e) => update.mutate({ followUpAt: e.target.value })} className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-semibold" />
            {b.followUpAt && <button onClick={() => update.mutate({ followUpAt: "" })} className="rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600">Clear</button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {[["Tomorrow", 1], ["In 3 days", 3], ["In a week", 7]].map(([l, n]) => <button key={l} onClick={() => update.mutate({ followUpAt: addDays(n as number) })} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">{l}</button>)}
          </div>
        </Block>

        <Block title="Client">
          <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /><a className="font-semibold" href={`tel:+91${b.phone}`}>+91 {b.phone}</a><button aria-label="Copy phone" onClick={() => copy(`+91${b.phone}`, "Number")} className="ml-auto text-slate-400"><Copy className="h-4 w-4" /></button></p>
          <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /><a className="break-all font-semibold" href={`mailto:${b.email}`}>{b.email}</a><button aria-label="Copy email" onClick={() => copy(b.email, "Email")} className="ml-auto text-slate-400"><Copy className="h-4 w-4" /></button></p>
          {b.company && <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" />{b.company}</p>}
        </Block>

        <Block title="Project">
          <p className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-slate-400" />Budget <b className="font-mono">{formatINR(b.budget)}</b></p>
          <p>Source: <b>{b.source || "direct"}</b>{b.inquiry && b.paymentStatus !== "paid" ? " · sent as an enquiry (no payment)" : ""}</p>
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
          {b.failures.map((fl, i) => <p key={i} className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">Failed {fmtDate(fl.at)} — {fl.reason}</p>)}
        </Block>

        <Block title="Private notes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={4000} className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" placeholder="Call notes, requirements, next steps…" />
          <button disabled={notes === b.notes || update.isPending} onClick={() => update.mutate({ notes })} className="rounded-full bg-primary px-5 py-2 font-bold text-white disabled:opacity-40">Save notes</button>
        </Block>

        <Block title="Timeline">
          <p className="text-xs text-slate-500">{fmtDate(b.createdAt)} — <b className="text-slate-700">Lead created</b></p>
          {b.statusHistory.slice(1).map((h, i) => <p key={i} className="text-xs text-slate-500">{fmtDate(h.at)} — <b className="text-slate-700">{STATUS_LABELS[h.status]}</b></p>)}
        </Block>

        <Block title="Actions">
          {b.paymentStatus === "paid" && (
            <button disabled={resend.isPending} onClick={() => resend.mutate()} className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-2.5 font-bold text-slate-700 disabled:opacity-50">
              {resend.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Re-send confirmation (email + WhatsApp PDF)
            </button>
          )}
          {!b.payments.length && b.paymentStatus !== "paid" ? (
            <button disabled={del.isPending} onClick={() => window.confirm(`Permanently delete the lead from ${b.name}? This can't be undone.`) && del.mutate()} className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 py-2.5 font-bold text-rose-700 disabled:opacity-50"><Trash2 className="h-4 w-4" />Delete lead (spam / test)</button>
          ) : (
            <p className="text-xs text-slate-500">Leads with payments can't be deleted (financial record) — set the status to Cancelled instead.</p>
          )}
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
