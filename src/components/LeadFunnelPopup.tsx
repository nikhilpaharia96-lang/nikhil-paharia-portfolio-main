import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Download, Loader2, Palette, ShieldCheck, Sparkles, Gift, X } from "lucide-react";
import { SiWhatsapp, SiReact, SiGoogleads, SiFigma, SiN8N, SiShopify, SiDavinciresolve } from "react-icons/si";
import premiereProLogo from "@/assets/logos/premiere-pro.svg";
import { Link } from "wouter";
import { services } from "@/components/Services";
import { track, consentRequired, getStoredConsent } from "@/lib/analytics";
import { getSource } from "@/lib/attribution";
import { sendQuickLead, PaymentError } from "@/lib/booking";
import { lockBodyScroll } from "@/lib/scrollLock";
import avatar from "../assets/images/funnel-avatar.webp";

/**
 * Lead funnel (no personal data in analytics; the lead itself goes to /admin + email via /api/booking/inquiry).
 *
 *   Trigger  → first of: 45 s on page · 70 % scroll · exit intent (desktop). Never while another dialog or the
 *              analytics-consent banner is open. Shown once automatically.
 *   Launcher → small "Free quote" pill stays available after the popup is dismissed (until a lead is sent).
 *              Anything on the site can also open it:  window.dispatchEvent(new CustomEvent("np:open-funnel", { detail: { service: "video-editing" } }))
 *   Step 1   → "What do you need?" (service cards with starting price)
 *   Step 2   → short form (name + WhatsApp number, email optional) · or WhatsApp now · brochure · book online
 *   Success  → reference number + "Message me on WhatsApp" (prefilled with the reference)
 * Every stage fires an anonymous funnel_* event so drop-off can be read in Clarity.
 */

const SEEN_KEY = "np-lead-funnel";
const LEAD_KEY = "np-lead-funnel-sent";
const DRAFT_KEY = "np-lead-funnel-draft";
const FILE = `${import.meta.env.BASE_URL}Nikhil-Paharia-Portfolio.pdf`;
const WHATSAPP_NUMBER = "919395722454";

type Mark = (p: { className?: string }) => JSX.Element;
const brand = (C: React.ComponentType<{ className?: string; style?: React.CSSProperties }>, color: string): Mark =>
  ({ className }) => <C className={className} style={{ color }} />;
const img = (src: string): Mark => ({ className }) => <img src={src} alt="" className={className} />;

// Real brand logos (Simple Icons / Adobe SVG) on a white tile.
const SERVICE_STYLE: Record<string, { Icon: Mark; from: string; to: string }> = {
  "website-development": { Icon: brand(SiReact, "#087EA4"), from: "#1266F1", to: "#4f9bff" },
  "video-editing": { Icon: img(premiereProLogo), from: "#e1306c", to: "#ff7aa8" },
  "digital-marketing": { Icon: brand(SiGoogleads, "#4285F4"), from: "#f59e0b", to: "#fcd34d" },
  "automation-ai-solutions": { Icon: brand(SiN8N, "#EA4B71"), from: "#059669", to: "#6ee7b7" },
  "e-commerce-solutions": { Icon: brand(SiShopify, "#5E8E3E"), from: "#ea580c", to: "#fdba74" },
  "cinematography-video-production": { Icon: brand(SiDavinciresolve, "#233A51"), from: "#334155", to: "#94a3b8" },
};
const styleOf = (slug: string) => SERVICE_STYLE[slug] ?? { Icon: brand(Sparkles, "#1266F1"), from: "#1266F1", to: "#4f9bff" };
const WA_GREEN = "#25D366";
const Wa = ({ className = "w-4 h-4", green = false }: { className?: string; green?: boolean }) => (
  <SiWhatsapp className={className} style={green ? { color: WA_GREEN } : undefined} aria-hidden="true" />
);

const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

type Pick = { slug: string; title: string } | null;
type Form = { name: string; phone: string; email: string; hp: string };
type Errors = Partial<Record<"name" | "phone" | "email" | "form", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digits10 = (raw: string) => { let d = raw.replace(/\D/g, ""); if (d.length > 10 && d.startsWith("91")) d = d.slice(2); if (d.length > 10 && d.startsWith("0")) d = d.slice(1); return d.slice(0, 10); };
const fmtPhone = (d: string) => (d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d);
function validate(f: Form): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  const d = digits10(f.phone);
  if (!/^[6-9]\d{9}$/.test(d)) e.phone = "Enter a valid 10-digit WhatsApp number.";
  if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email, or leave it empty.";
  return e;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([tabindex="-1"]),[tabindex]:not([tabindex="-1"])';

export default function LeadFunnelPopup() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [pick, setPick] = useState<Pick>(null);
  const [form, setForm] = useState<Form>({ name: "", phone: "", email: "", hp: "" });
  const [err, setErr] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [launcher, setLauncher] = useState(false);
  const [leadSent, setLeadSent] = useState(() => !!ls.get(LEAD_KEY));
  const reduce = !!useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const autoShown = useRef(!!ls.get(SEEN_KEY));
  const openRef = useRef(false);
  openRef.current = open;

  /* restore an unfinished draft for this tab */
  useEffect(() => {
    try {
      const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
      if (d?.form) setForm((f) => ({ ...f, name: d.form.name || "", phone: d.form.phone || "", email: d.form.email || "" }));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form: { name: form.name, phone: form.phone, email: form.email } })); } catch { /* ignore */ }
  }, [form.name, form.phone, form.email]);

  const openFunnel = useCallback((how: string, service?: string) => {
    returnFocus.current = (document.activeElement as HTMLElement) ?? null;
    const s = service ? services.find((x) => x.slug === service) : undefined;
    if (s) { setPick({ slug: s.slug, title: s.title }); setStep(2); } else { setStep(1); setPick(null); }
    setOpen(true);
    track("funnel_shown", { trigger: how });
  }, []);

  const close = useCallback((how = "dismissed") => {
    ls.set(SEEN_KEY, String(Date.now())); autoShown.current = true;
    track("funnel_closed", { step: String(step), how, lead: done ? "yes" : "no" });
    setOpen(false);
    window.setTimeout(() => returnFocus.current?.focus?.(), 50);
  }, [step, done]);

  /* auto triggers: time · scroll depth · exit intent */
  useEffect(() => {
    if (autoShown.current || leadSent) return;
    let fired = false;
    const blocked = () => openRef.current || !!document.querySelector('[role="dialog"]') || (consentRequired() && getStoredConsent() === null);
    const fire = (how: string) => {
      if (fired || autoShown.current) return;
      if (blocked()) { window.setTimeout(() => fire(how), 5000); return; }
      fired = true; ls.set(SEEN_KEY, String(Date.now())); autoShown.current = true; openFunnel(how);
    };
    const t = window.setTimeout(() => fire("time"), 45000);
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0 && window.scrollY / h > 0.7) fire("scroll");
    };
    const canExit = window.matchMedia?.("(pointer: fine)").matches;
    const armed = window.setTimeout(() => { if (canExit) document.addEventListener("mouseout", onOut); }, 4000);
    const onOut = (e: MouseEvent) => { if (!e.relatedTarget && e.clientY <= 0) fire("exit"); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.clearTimeout(t); window.clearTimeout(armed); window.removeEventListener("scroll", onScroll); document.removeEventListener("mouseout", onOut); };
  }, [leadSent, openFunnel]);

  /* launcher + external open event */
  useEffect(() => {
    const t = window.setTimeout(() => setLauncher(true), 3000);
    const onOpen = (e: Event) => openFunnel("event", (e as CustomEvent).detail?.service);
    window.addEventListener("np:open-funnel", onOpen);
    return () => { window.clearTimeout(t); window.removeEventListener("np:open-funnel", onOpen); };
  }, [openFunnel]);

  /* modal behaviour: scroll lock, Esc, focus trap, initial focus */
  useEffect(() => {
    if (!open) return;
    const unlock = lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close("esc"); return; }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const els = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    const f = window.setTimeout(() => {
      const target = step === 2 && pick && !done ? nameRef.current : dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus();
    }, 60);
    return () => { unlock(); window.removeEventListener("keydown", onKey); window.clearTimeout(f); };
  }, [open, step, pick, done, close]);

  const choose = (p: Pick) => { setPick(p); setStep(2); setErr({}); track("funnel_need_selected", { service: p?.slug ?? "browsing" }); };

  const waHref = (ref?: string) => {
    const need = pick ? `I'm interested in ${pick.title}` : "I'd like to know more about your services";
    const src = getSource();
    const msg = ref
      ? `Hi Nikhil! I just sent a free-quote request on your website for ${pick?.title ?? "your services"} (Ref: ${ref}).`
      : `Hi Nikhil! I saw your portfolio and ${need}. Could you share a free quote?${src ? `\n\n(via ${src})` : ""}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  const touch = (k: keyof Form) => { const e = validate(form); setErr((p) => ({ ...p, [k]: e[k as keyof Errors] })); };
  const started = useRef(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pick || busy) return;
    const ve = validate(form);
    if (Object.keys(ve).length) {
      setErr(ve); track("funnel_form_invalid", { fields: Object.keys(ve).join(",") });
      const k = (["name", "phone", "email"] as const).find((x) => ve[x]);
      (dialogRef.current?.querySelector(`[name="${k}"]`) as HTMLElement | null)?.focus();
      return;
    }
    setBusy(true); setErr({});
    try {
      const r = await sendQuickLead({ service: pick.slug, name: form.name.trim(), phone: digits10(form.phone), email: form.email.trim() }, form.hp);
      ls.set(LEAD_KEY, String(Date.now())); ls.set(SEEN_KEY, String(Date.now())); setLeadSent(true); setLauncher(false);
      setDone(r.ref); track("funnel_lead_submitted", { service: pick.slug });
    } catch (ex) {
      const fe = (ex as PaymentError).fieldErrors as Record<string, string> | undefined;
      const hasField = !!fe && Object.keys(fe).length > 0;
      setErr({ ...(fe ?? {}), form: hasField ? "" : (ex as Error).message });
      track("funnel_submit_error", { reason: hasField ? "validation" : "network" });
    } finally { setBusy(false); }
  };

  const btn = "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40";
  const primary = `${btn} bg-gradient-to-r from-[#1266F1] to-[#2f86ff] text-white shadow-[0_14px_30px_-10px_rgba(18,102,241,0.7)] hover:shadow-[0_18px_36px_-10px_rgba(18,102,241,0.85)] hover:-translate-y-0.5 active:translate-y-0`;
  const secondary = `${btn} border-2 border-blue-100 bg-white text-[#0b1530] hover:bg-blue-50 hover:border-blue-200`;
  const field = "w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-[#0b1530] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary";

  return (
    <>
      {/* launcher — stays available after the popup is dismissed, hidden once a lead is sent */}
      <AnimatePresence>
        {launcher && !open && !leadSent && (
          <motion.button
            type="button" aria-label="Get a free quote"
            initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.12 } }}
            transition={{ duration: reduce ? 0 : 0.3 }}
            onClick={() => { track("funnel_launcher_click"); openFunnel("launcher"); }}
            className="group fixed z-[80] right-6 bottom-6 hidden md:inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#1266F1] to-[#2f86ff] p-1.5 pr-4 text-[13px] font-bold uppercase tracking-wider text-white shadow-[0_14px_32px_-8px_rgba(18,102,241,0.7)] hover:-translate-y-0.5 transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            style={{ marginBottom: "env(safe-area-inset-bottom)" }}
          >
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white/20 ring-2 ring-white/60">
              <img src={avatar} alt="" width={36} height={36} className="h-full w-full object-cover" />
              <span aria-hidden="true" className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
            </span>
            <span className="hidden min-[400px]:inline">Free quote</span><span className="min-[400px]:hidden">Quote</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/55 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.12 } }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            onClick={() => close("backdrop")}
          >
            <motion.div
              ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="funnel-title"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduce ? 0 : 12, transition: { duration: reduce ? 0 : 0.14, ease: [0.7, 0, 0.84, 0] } }}
              transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-[28px] sm:rounded-[28px] bg-white border border-blue-100 shadow-[0_40px_100px_-24px_rgba(15,45,90,0.6)] px-5 pb-6 sm:px-8 sm:pb-8"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))", transformOrigin: "100% 100%" }}
            >
              {/* brand header band */}
              <div className="-mx-5 sm:-mx-8 mb-5 relative overflow-hidden px-5 sm:px-8 pt-3 pb-4" style={{ background: "linear-gradient(135deg,#0b1530 0%,#123a9c 60%,#1266F1 100%)" }}>
                <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full" style={{ background: "radial-gradient(circle,rgba(127,178,255,0.45),transparent 70%)" }} />
                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/30 sm:hidden" aria-hidden="true" />
                <div className="relative flex items-center gap-3 pr-12">
                  {step === 2 && !done && (
                    <button type="button" onClick={() => { setStep(1); setErr({}); }} aria-label="Back to services"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/70" style={{ background: "linear-gradient(135deg,#1266F1,#7fb2ff)" }}>
                    <img src={avatar} alt="Nikhil Paharia" width={48} height={48} className="h-full w-full object-cover" />
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[15px] font-bold text-white">Nikhil Paharia</span>
                    <span className="block truncate text-xs text-blue-100/90">Web Developer &amp; Video Editor · Assam</span>
                  </span>
                </div>
                <button type="button" onClick={() => close("x")} aria-label="Close"
                  className="absolute top-1.5 right-1.5 sm:top-1.5 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">
                  <X className="w-4 h-4" />
                </button>
                <div className="relative mt-4 flex gap-1.5" aria-hidden="true">
                  <span className="h-1 flex-1 rounded-full bg-white" />
                  <span className={`h-1 flex-1 rounded-full transition-colors ${step === 2 ? "bg-white" : "bg-white/25"}`} />
                </div>
              </div>

              {step === 1 ? (
                <div className="text-center">
                  <h2 id="funnel-title" className="text-2xl font-extrabold tracking-tight text-[#0b1530]">What do you need help with?</h2>
                  <p className="mt-2 text-sm text-slate-600">Pick one — I'll send you a free quote. Takes 20 seconds.</p>
                  <div className="mt-5 grid grid-cols-2 gap-2.5 text-left">
                    {services.map((s) => {
                      const st = styleOf(s.slug);
                      return (
                        <button key={s.slug} type="button" onClick={() => choose({ slug: s.slug, title: s.title })}
                          className="group flex flex-col items-start gap-2 rounded-2xl border border-blue-100 bg-white px-3 py-3 text-left shadow-[0_6px_16px_-10px_rgba(15,45,90,0.35)] hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_14px_26px_-12px_rgba(18,102,241,0.45)] active:scale-[0.99] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40">
                          <span className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm">
                            <st.Icon className="h-5 w-5 object-contain" />
                          </span>
                          <span className="block text-[13px] font-bold leading-tight text-[#0b1530]">{s.title}</span>
                          <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10.5px] font-semibold text-primary">from {s.price}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button type="button" onClick={() => choose(null)} className="mt-4 inline-flex min-h-[44px] items-center text-sm font-medium text-slate-500 hover:text-slate-700">
                    Just browsing — show me the brochure
                  </button>
                </div>
              ) : done ? (
                <div className="text-center" role="status">
                  <motion.span initial={{ scale: reduce ? 1 : 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-7 w-7" aria-hidden="true" />
                  </motion.span>
                  <h2 id="funnel-title" className="mt-3 text-2xl font-extrabold tracking-tight text-[#0b1530]">Request received!</h2>
                  <p className="mt-2 text-sm text-slate-600">I'll message you on WhatsApp with your free quote. Your reference: <b className="text-[#0b1530]">{done}</b></p>
                  <div className="mt-5 space-y-3">
                    <a href={waHref(done)} target="_blank" rel="noopener noreferrer" onClick={() => { track("funnel_whatsapp_click", { service: pick?.slug ?? "browsing", after: "lead" }); }} className={primary}>
                      <Wa /> Message me on WhatsApp
                    </a>
                    <a href={FILE} download="Nikhil-Paharia-Portfolio.pdf" onClick={() => track("funnel_brochure_download", { service: pick?.slug ?? "browsing" })} className={secondary}>
                      <Download className="w-4 h-4" aria-hidden="true" /> Download brochure (PDF)
                    </a>
                    {pick && (
                      <Link href={`/services/${pick.slug}`} onClick={() => { track("funnel_book_click", { service: pick.slug }); setOpen(false); }}
                        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                        Ready to start? See pricing &amp; book <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  {pick && (() => { const st = styleOf(pick.slug); return (
                    <span className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 py-1 pl-1 pr-3 text-xs font-semibold text-[#0b1530]">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-white"><st.Icon className="h-3.5 w-3.5" /></span>
                      {pick.title}
                    </span>); })()}
                  <h2 id="funnel-title" className="text-2xl font-extrabold tracking-tight text-[#0b1530]">
                    {pick ? "Get your free quote" : "Here's how I can help"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {pick ? "Leave your WhatsApp number and I'll send you a quote." : "Choose how you'd like to continue."}
                  </p>

                  {pick && (
                    <form onSubmit={submit} noValidate className="mt-5 space-y-3 text-left">
                      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.hp} onChange={(e) => setForm({ ...form, hp: e.target.value })} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                      <div>
                        <label htmlFor="fn-name" className="mb-1 block text-xs font-semibold text-slate-600">Your name</label>
                        <input id="fn-name" ref={nameRef} name="name" type="text" autoComplete="name" enterKeyHint="next" placeholder="e.g. Asha Das"
                          aria-invalid={!!err.name} aria-describedby={err.name ? "fn-name-e" : undefined}
                          value={form.name} onChange={(e) => { if (!started.current) { started.current = true; track("funnel_form_started"); } setForm({ ...form, name: e.target.value }); if (err.name) setErr({ ...err, name: undefined }); }}
                          onBlur={() => form.name && touch("name")} className={`${field} ${err.name ? "border-red-400" : "border-blue-100"}`} />
                        {err.name && <p id="fn-name-e" className="mt-1 px-1 text-xs text-red-600">{err.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="fn-phone" className="mb-1 block text-xs font-semibold text-slate-600">WhatsApp number</label>
                        <div className={`flex items-center rounded-xl border bg-white focus-within:ring-4 focus-within:ring-primary/30 focus-within:border-primary ${err.phone ? "border-red-400" : "border-blue-100"}`}>
                          <span className="pl-4 pr-2 text-[15px] font-semibold text-slate-500 select-none" aria-hidden="true">+91</span>
                          <input id="fn-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" enterKeyHint="next" placeholder="98765 43210"
                            aria-invalid={!!err.phone} aria-describedby={err.phone ? "fn-phone-e" : undefined}
                            value={fmtPhone(digits10(form.phone))} onChange={(e) => { setForm({ ...form, phone: digits10(e.target.value) }); if (err.phone) setErr({ ...err, phone: undefined }); }}
                            onBlur={() => form.phone && touch("phone")} className="w-full rounded-r-xl bg-transparent py-3 pr-4 text-[15px] text-[#0b1530] placeholder:text-slate-400 focus:outline-none" />
                        </div>
                        {err.phone && <p id="fn-phone-e" className="mt-1 px-1 text-xs text-red-600">{err.phone}</p>}
                      </div>
                      <div>
                        <label htmlFor="fn-email" className="mb-1 block text-xs font-semibold text-slate-600">Email <span className="font-normal text-slate-400">(optional)</span></label>
                        <input id="fn-email" name="email" type="email" autoComplete="email" enterKeyHint="send" placeholder="you@example.com"
                          aria-invalid={!!err.email} aria-describedby={err.email ? "fn-email-e" : undefined}
                          value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); if (err.email) setErr({ ...err, email: undefined }); }}
                          onBlur={() => form.email && touch("email")} className={`${field} ${err.email ? "border-red-400" : "border-blue-100"}`} />
                        {err.email && <p id="fn-email-e" className="mt-1 px-1 text-xs text-red-600">{err.email}</p>}
                      </div>
                      <div aria-live="polite">{err.form && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{err.form}</p>}</div>
                      <button type="submit" disabled={busy} className={`${primary} disabled:opacity-70`}>
                        {busy ? (<><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Sending…</>) : "Send my free-quote request"}
                      </button>
                      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1 text-[11px] font-medium text-slate-500">
                        <li className="inline-flex items-center gap-1"><Gift className="h-3.5 w-3.5 text-primary" aria-hidden="true" />Free quote</li>
                        <li className="inline-flex items-center gap-1"><Wa className="h-3.5 w-3.5" green />Reply on WhatsApp</li>
                        <li className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />No spam</li>
                      </ul>
                    </form>
                  )}

                  <div className="mt-4 space-y-2">
                    <a href={waHref()} target="_blank" rel="noopener noreferrer"
                      onClick={() => { ls.set(SEEN_KEY, String(Date.now())); track("funnel_whatsapp_click", { service: pick?.slug ?? "browsing" }); setOpen(false); }}
                      className={pick ? secondary : primary}>
                      <Wa green={!!pick} /> {pick ? "Or chat on WhatsApp now" : "Get a free quote on WhatsApp"}
                    </a>
                    <a href={FILE} download="Nikhil-Paharia-Portfolio.pdf" onClick={() => track("funnel_brochure_download", { service: pick?.slug ?? "browsing" })} className={secondary}>
                      <Download className="w-4 h-4" aria-hidden="true" /> Download brochure (PDF)
                    </a>
                    {pick && (
                      <Link href={`/services/${pick.slug}`} onClick={() => { track("funnel_book_click", { service: pick.slug }); setOpen(false); }}
                        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                        See pricing &amp; book online <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
