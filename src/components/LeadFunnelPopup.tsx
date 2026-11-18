import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Download, MessageCircle, X } from "lucide-react";
import { Link } from "wouter";
import { services } from "@/components/Services";
import { track } from "@/lib/analytics";
import { getSource } from "@/lib/attribution";

/**
 * First-visit lead funnel (no backend, no personal data stored):
 *   Step 1  "What do you need?"      → qualifies the visitor (service chips)
 *   Step 2  Free quote on WhatsApp   → the lead lands in the owner's WhatsApp with the service + source prefilled
 *           Download brochure (PDF)  → lead magnet
 *           See pricing & book       → existing /services/:slug booking flow
 * Every stage fires an anonymous analytics event (funnel_*) so drop-off can be read in Clarity.
 */

const KEY = "np-lead-funnel";
const FILE = `${import.meta.env.BASE_URL}Nikhil-Paharia-Portfolio.pdf`;
const WHATSAPP_NUMBER = "919395722454";
const DELAY_MS = 5000;

const seen = () => { try { return !!localStorage.getItem(KEY); } catch { return false; } };
const remember = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch { /* private mode */ } };

type Pick = { slug: string; title: string } | null;

export default function LeadFunnelPopup() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [pick, setPick] = useState<Pick>(null);
  const reduce = !!useReducedMotion();
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (seen()) return;
    const t = window.setTimeout(() => { setOpen(true); track("funnel_shown"); }, DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const close = (how = "dismissed") => { remember(); track("funnel_closed", { step: String(step), how }); setOpen(false); };

  useEffect(() => {
    if (!open) return;
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close("esc"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const choose = (p: Pick) => { setPick(p); setStep(2); track("funnel_need_selected", { service: p?.slug ?? "browsing" }); };

  const waHref = () => {
    const need = pick ? `I'm interested in ${pick.title}` : "I'd like to know more about your services";
    const src = getSource();
    const msg = `Hi Nikhil! I saw your portfolio and ${need}. Could you share a free quote?${src ? `\n\n(via ${src})` : ""}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  const btn = "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
          onClick={() => close("backdrop")}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="funnel-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 16 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-blue-100 shadow-[0_30px_80px_-20px_rgba(15,45,90,0.45)] p-6 sm:p-8"
          >
            <button type="button" onClick={() => close("x")} aria-label="Close"
              className="absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center text-slate-500 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40">
              <X className="w-5 h-5" />
            </button>

            {step === 1 ? (
              <div className="text-center">
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary">Step 1 of 2</p>
                <h2 id="funnel-title" className="mt-1 text-2xl font-extrabold tracking-tight text-[#0b1530]">What do you need help with?</h2>
                <p className="mt-2 text-sm text-slate-600">Pick one and I'll show the best next step — free quote, prices and my brochure.</p>
                <div className="mt-5 grid grid-cols-2 gap-2.5 text-left">
                  {services.map((s, i) => (
                    <button
                      key={s.slug} type="button" ref={i === 0 ? first : undefined} onClick={() => choose({ slug: s.slug, title: s.title })}
                      className="rounded-2xl border border-blue-100 bg-blue-50/60 px-3.5 py-3 text-[13px] font-semibold leading-tight text-[#0b1530] hover:border-primary hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => choose(null)} className="mt-4 text-sm font-medium text-slate-500 hover:text-slate-700">
                  Just browsing — show me the brochure
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary">Step 2 of 2</p>
                <h2 id="funnel-title" className="mt-1 text-2xl font-extrabold tracking-tight text-[#0b1530]">
                  {pick ? `Great — let's talk ${pick.title}` : "Here's how I can help"}
                </h2>
                <p className="mt-2 text-sm text-slate-600">Choose how you'd like to continue. I usually reply on WhatsApp.</p>
                <div className="mt-5 space-y-3">
                  <a ref={undefined} href={waHref()} target="_blank" rel="noopener noreferrer"
                    onClick={() => { remember(); track("funnel_whatsapp_click", { service: pick?.slug ?? "browsing" }); setOpen(false); }}
                    className={`${btn} bg-[#1266F1] text-white shadow-lg hover:bg-[#0F58D6]`}>
                    <MessageCircle className="w-4 h-4" aria-hidden="true" /> Get a free quote on WhatsApp
                  </a>
                  <a href={FILE} download="Nikhil-Paharia-Portfolio.pdf"
                    onClick={() => { remember(); track("funnel_brochure_download", { service: pick?.slug ?? "browsing" }); }}
                    className={`${btn} border-2 border-blue-100 bg-white text-[#0b1530] hover:bg-blue-50`}>
                    <Download className="w-4 h-4" aria-hidden="true" /> Download brochure (PDF)
                  </a>
                  {pick && (
                    <Link href={`/services/${pick.slug}`}
                      onClick={() => { remember(); track("funnel_book_click", { service: pick.slug }); setOpen(false); }}
                      className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                      See pricing &amp; book online <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  )}
                </div>
                <button type="button" onClick={() => setStep(1)} className="mt-4 text-sm font-medium text-slate-500 hover:text-slate-700">← Change my choice</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
