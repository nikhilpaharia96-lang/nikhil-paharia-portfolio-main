import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2, LogOut, RefreshCw } from "lucide-react";

/**
 * "Visitors" tab of the admin dashboard: anonymous visit log written by api/visit.ts (same fields as the notification
 * email — never an IP address or user-agent string). Data comes from GET /api/admin/visitors behind the admin session.
 */
interface Visit { t: number; p: string; s: string; d: string; b: string; o: string; l?: string }
interface VisitorsResponse { storage: boolean; retentionDays: number; visits: Visit[] }

const CLARITY_ID = (import.meta.env.VITE_CLARITY_PROJECT_ID || "z98h3pxnvk").trim();
const RANGES = [{ days: 1, label: "24 h" }, { days: 7, label: "7 days" }, { days: 30, label: "30 days" }, { days: 90, label: "90 days" }];
const PAGE = 40;
const card = "rounded-3xl border border-white/60 bg-white/70 p-5 shadow-xl backdrop-blur-xl";

const fmtTime = (t: number) =>
  new Date(t).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

async function fetchVisitors(days: number): Promise<VisitorsResponse> {
  const res = await fetch(`/api/admin/visitors?days=${days}`, { credentials: "same-origin" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Request failed"), { status: res.status });
  return data as VisitorsResponse;
}

function tally(visits: Visit[], pick: (v: Visit) => string | undefined, top = 5): [string, number][] {
  const m = new Map<string, number>();
  for (const v of visits) {
    const k = pick(v);
    if (k) m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, top);
}

function BarList({ title, rows, total }: { title: string; rows: [string, number][]; total: number }) {
  return (
    <section className={card}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {rows.length === 0 && <li className="text-sm text-slate-400">No data yet</li>}
        {rows.map(([label, n]) => (
          <li key={label}>
            <div className="flex justify-between gap-3 text-sm">
              <span className="truncate font-medium text-slate-800">{label}</span>
              <span className="shrink-0 tabular-nums text-slate-500">{n}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, (n / total) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function VisitorsPanel({ onLogout }: { onLogout: () => void }) {
  const [days, setDays] = useState(7);
  const [shown, setShown] = useState(PAGE);
  const q = useQuery({ queryKey: ["admin", "visitors", days], queryFn: () => fetchVisitors(days), refetchInterval: 60_000, retry: false });
  const visits = q.data?.visits ?? [];

  const stats = useMemo(() => {
    const total = visits.length;
    const mobile = visits.filter((v) => v.d === "Mobile").length;
    return {
      total,
      mobilePct: total ? Math.round((mobile / total) * 100) : 0,
      sources: tally(visits, (v) => v.s),
      places: tally(visits, (v) => v.l),
      pages: tally(visits, (v) => v.p),
      devices: tally(visits, (v) => v.d, 3),
    };
  }, [visits]);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-black uppercase text-slate-900">Visitors</h1>
        <div className="flex gap-2">
          <a href={`https://clarity.microsoft.com/projects/view/${CLARITY_ID}/dashboard`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white">
            Clarity <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button type="button" onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-bold text-slate-600">
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Date range">
        {RANGES.map((r) => (
          <button key={r.days} type="button" aria-pressed={days === r.days} onClick={() => { setDays(r.days); setShown(PAGE); }}
            className={`rounded-full px-4 py-2 text-xs font-bold ${days === r.days ? "bg-slate-900 text-white" : "border border-slate-200 bg-white/80 text-slate-600"}`}>
            {r.label}
          </button>
        ))}
        <button type="button" onClick={() => q.refetch()} disabled={q.isFetching} className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-primary disabled:opacity-50">
          <RefreshCw className={`h-3.5 w-3.5 ${q.isFetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {q.isLoading && <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-primary" />}
      {q.isError && <p role="alert" className="mt-4 text-sm text-red-600">Could not load visitor data. {(q.error as Error).message}</p>}

      {q.data && !q.data.storage && (
        <section className={`${card} mt-5 text-sm leading-relaxed text-slate-700`}>
          <h2 className="font-bold">Visit history needs a database</h2>
          <p className="mt-2">Set <code>UPSTASH_REDIS_REST_URL</code> and <code>UPSTASH_REDIS_REST_TOKEN</code> in Vercel (the same Upstash database your bookings use) and redeploy. New visits will then appear here.</p>
        </section>
      )}

      {q.data?.storage && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[["Visits", String(stats.total)], ["Mobile", `${stats.mobilePct}%`], ["Top source", stats.sources[0]?.[0] ?? "—"], ["Top location", stats.places[0]?.[0] ?? "—"]].map(([k, v]) => (
              <div key={k} className={card}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{k}</p>
                <p className="mt-1 break-words text-lg font-black leading-tight text-slate-900">{v}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <BarList title="Traffic sources" rows={stats.sources} total={stats.total} />
            <BarList title="Locations (approx.)" rows={stats.places} total={stats.total} />
            <BarList title="Pages" rows={stats.pages} total={stats.total} />
            <BarList title="Devices" rows={stats.devices} total={stats.total} />
          </div>

          <section className={`${card} mt-4 !p-0 overflow-hidden`}>
            <h2 className="border-b border-slate-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Recent visits</h2>
            {visits.length === 0 && <p className="p-5 text-sm text-slate-400">No visits in this period.</p>}
            <ul className="divide-y divide-slate-100">
              {visits.slice(0, shown).map((v, i) => (
                <li key={`${v.t}-${i}`} className="grid gap-x-4 gap-y-0.5 px-5 py-3 text-sm md:grid-cols-[9rem_1fr_7rem_1.2fr]">
                  <span className="font-semibold tabular-nums text-slate-800">{fmtTime(v.t)}</span>
                  <span className="truncate text-slate-700">{v.p} <span className="text-slate-400">· {v.s}</span></span>
                  <span className="text-slate-600">{v.d}</span>
                  <span className="truncate text-slate-500">{v.b} · {v.o}{v.l ? ` · ${v.l}` : ""}</span>
                </li>
              ))}
            </ul>
            {visits.length > shown && (
              <button type="button" onClick={() => setShown((n) => n + PAGE)} className="w-full border-t border-slate-100 px-5 py-3 text-xs font-bold text-primary">Show more</button>
            )}
          </section>
          <p className="mt-4 text-center text-xs text-slate-400">Anonymous data only — no IP addresses. Times in IST. Records are deleted after {q.data.retentionDays} days.</p>
        </>
      )}
    </div>
  );
}
