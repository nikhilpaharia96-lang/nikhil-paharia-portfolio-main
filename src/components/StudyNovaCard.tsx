import { ArrowUpRight, Sparkles } from "lucide-react";

/** Entry point from the portfolio to the StudyNova AI hackathon prototype (/studynova). */
export default function StudyNovaCard() {
  return (
    <section className="py-10 sm:py-14" aria-label="StudyNova AI prototype">
      <div className="container-tight">
        <a
          href="/studynova"
          className="group block rounded-2xl p-6 sm:p-8 text-white shadow-xl transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#050914 0%,#0b1a4a 55%,#3b1d8f 100%)" }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
            <Sparkles className="w-4 h-4" aria-hidden="true" /> Hackathon prototype
          </span>
          <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold">StudyNova AI — One AI. Your Entire World.</h3>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-300">
            An interactive concept prototype: Nova Brain workflow, four AI module demos, a WhatsApp simulation and a presentation mode. Scripted sample data — no real AI.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 font-semibold text-cyan-300">
            Open the demo <ArrowUpRight className="w-4 h-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
        </a>
      </div>
    </section>
  );
}
