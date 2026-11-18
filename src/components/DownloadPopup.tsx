import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Download, FileText, X } from "lucide-react";

const KEY = "np-brochure-popup";
const FILE = `${import.meta.env.BASE_URL}Nikhil-Paharia-Portfolio.pdf`;
const DELAY_MS = 5000;

const seen = () => { try { return !!localStorage.getItem(KEY); } catch { return false; } };
const remember = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch { /* private mode */ } };

/** One-time "download my portfolio brochure" popup for first-time visitors (shown ~5s after load). */
export default function DownloadPopup() {
  const [open, setOpen] = useState(false);
  const reduce = !!useReducedMotion();
  const btnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (seen()) return;
    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const close = () => { remember(); setOpen(false); };

  useEffect(() => {
    if (!open) return;
    btnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
          onClick={close}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="dl-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 16 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-3xl bg-white border border-blue-100 shadow-[0_30px_80px_-20px_rgba(15,45,90,0.45)] p-6 sm:p-8 text-center"
          >
            <button type="button" onClick={close} aria-label="Close"
              className="absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center text-slate-500 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40">
              <X className="w-5 h-5" />
            </button>
            <span className="mx-auto mb-4 grid place-items-center w-14 h-14 rounded-2xl bg-blue-50 text-primary">
              <FileText className="w-7 h-7" aria-hidden="true" />
            </span>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary">Free download</p>
            <h2 id="dl-title" className="mt-1 text-2xl font-extrabold tracking-tight text-[#0b1530]">Get my Portfolio Brochure</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Services, starting prices, selected projects and contact details — all in one 2-page PDF.
            </p>
            <a
              ref={btnRef}
              href={FILE}
              download="Nikhil-Paharia-Portfolio.pdf"
              onClick={() => { remember(); window.setTimeout(() => setOpen(false), 400); }}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1266F1] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:bg-[#0F58D6] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            >
              <Download className="w-4 h-4" aria-hidden="true" /> Download PDF
            </a>
            <button type="button" onClick={close} className="mt-3 text-sm font-medium text-slate-500 hover:text-slate-700">
              Maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
