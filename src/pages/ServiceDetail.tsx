import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, ShieldCheck, Sparkles, Wallet, BadgeCheck, Headphones, Rocket, Gem, Receipt } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingDialog from "@/components/service-detail/BookingDialog";
import NotFound from "@/pages/not-found";
import { services } from "@/components/Services";
import { getServiceDetail, WHY_CHOOSE_ME, type Tool } from "@/constants/serviceDetails";
import { usePageSeo } from "@/hooks/usePageSeo";
import {
  SERVICE_PRICES, computeQuote, normalizeSplit, validateTotal, formatINR, MAX_PROJECT_TOTAL_INR,
  type ServiceSlug,
} from "../../shared/servicePricing";

// Keep in sync with the server's BOOKING_TOKEN_PERCENT / START_ADVANCE_PERCENT (default 5 / 25).
const SPLIT = normalizeSplit(import.meta.env.VITE_BOOKING_TOKEN_PERCENT, import.meta.env.VITE_START_ADVANCE_PERCENT);

const ease = [0.16, 1, 0.3, 1] as const;
const whyIcons = [Gem, Sparkles, Receipt, Rocket, Headphones, ShieldCheck];

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const rm = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: rm ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: rm ? 0.2 : 0.6, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: React.ReactNode }) {
  return (
    <Reveal className="mb-10 text-center">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
      <h2 className="font-serif text-3xl font-black uppercase leading-tight tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <div className="section-divider mx-auto mt-4" />
    </Reveal>
  );
}

function ToolBadge({ t }: { t: Tool }) {
  const Icon = t.icon;
  return (
    <div className="flex w-[92px] flex-col items-center gap-2 text-center sm:w-[104px]">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:h-[72px] sm:w-[72px]">
        {t.logo ? (
          <img src={t.logo} alt="" className="h-9 w-9 rounded-md" />
        ) : Icon ? (
          <Icon className="text-3xl sm:text-[34px]" style={{ color: t.color }} />
        ) : (
          <span className="text-xl font-extrabold tracking-tight" style={{ color: t.color }}>{t.text}</span>
        )}
      </span>
      <span className="text-xs font-semibold leading-tight text-slate-600">{t.label}</span>
    </div>
  );
}

export default function ServiceDetail() {
  const [match, params] = useRoute("/services/:slug");
  const slug = (params as { slug?: string } | null)?.slug ?? "";
  const detail = getServiceDetail(slug);
  const card = services.find((s) => s.slug === slug);
  const [location, navigate] = useLocation();
  const rm = useReducedMotion();

  // Always open a service page at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  // Navbar / footer anchors (#about, #contact…) belong to the home page — send them there.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      navigate(`/${a.getAttribute("href")}`);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  const price = detail ? SERVICE_PRICES[detail.slug] : undefined;
  const number = detail ? String(services.findIndex((s) => s.slug === slug) + 1).padStart(2, "0") : "";

  const [totalText, setTotalText] = useState(() => String(detail?.suggestedTotal ?? ""));
  useEffect(() => setTotalText(String(getServiceDetail(slug)?.suggestedTotal ?? "")), [slug]);
  const [bookingOpen, setBookingOpen] = useState(false);

  const total = Number(totalText.replace(/[^\d]/g, ""));
  const totalError = detail ? validateTotal(detail.slug, total) : null;
  const quote = useMemo(() => computeQuote(totalError ? price?.startingPrice ?? 0 : total, SPLIT), [total, totalError, price]);

  const seo = useMemo(
    () =>
      detail && price
        ? {
            title: `${price.title} — Starting ${formatINR(price.startingPrice)}${price.unit} | Nikhil Paharia`,
            description: detail.seoDescription,
            path: `/services/${detail.slug}`,
            jsonLd: {
              "@context": "https://schema.org",
              "@type": "Service",
              name: price.title,
              description: detail.seoDescription,
              provider: { "@type": "Person", name: "Nikhil Paharia" },
              areaServed: "IN",
              offers: { "@type": "Offer", priceCurrency: "INR", price: String(price.startingPrice) },
            },
          }
        : { title: "Service not found | Nikhil Paharia", description: "This service page does not exist.", path: location },
    [detail, price, location],
  );
  usePageSeo(seo);

  if (!match || !detail || !price || !card) return <NotFound />;

  return (
    <motion.div
      key={slug}
      initial={{ opacity: 0, y: rm ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: rm ? 0.15 : 0.55, ease }}
    >
      <Navbar />
      <main className="max-w-full overflow-x-hidden bg-gradient-to-b from-blue-50/60 via-white to-white">
        {/* ── Hero ── */}
        <section className="relative px-4 pb-14 pt-28 sm:pt-32">
          <div className="mx-auto max-w-5xl">
            <Link href="/#services" className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> All services
            </Link>

            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="font-serif text-5xl font-black leading-none text-primary/20 sm:text-6xl">{number}</span>
                  {card.badges?.map((b) => {
                    const Icon = b.icon;
                    return (
                      <span key={b.label} title={b.label} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md">
                        {b.logo ? <img src={b.logo} alt={b.label} className="h-7 w-7 rounded-md" /> : Icon ? <Icon className="text-2xl" style={{ color: b.color }} /> : <span className="text-lg font-extrabold" style={{ color: b.color }}>{b.text}</span>}
                      </span>
                    );
                  })}
                </div>
                <h1 className="font-serif text-3xl font-black uppercase leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">{price.title}</h1>
                <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">{card.desc}</p>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-baseline gap-2 rounded-full bg-gradient-to-br from-[#1d6feb] to-[#0f58d6] px-5 py-2.5 text-white shadow-lg shadow-primary/30">
                    <span className="text-[11px] font-semibold uppercase tracking-wide opacity-80">Starting from</span>
                    <span className="font-mono text-lg font-extrabold">{formatINR(price.startingPrice)}{price.unit}</span>
                  </span>
                  <a href="#book" onClick={(e) => { e.preventDefault(); document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="inline-flex items-center gap-2 rounded-full bg-slate-900 py-1.5 pl-5 pr-1.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800">
                    See pricing
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900"><ArrowRight className="h-4 w-4" /></span>
                  </a>
                </div>
              </div>
              <motion.img
                src={card.image}
                alt={`${price.title} illustration`}
                width={1200}
                height={800}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease, delay: 0.15 }}
                className="mx-auto w-full max-w-md select-none drop-shadow-[0_18px_30px_rgba(2,6,23,0.3)] md:max-w-none"
                draggable={false}
              />
            </div>
          </div>
        </section>

        {/* ── A. Service introduction ── */}
        <section className="px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <SectionHead eyebrow="About this service" title={<>What is <span className="text-gradient">{price.title}</span>?</>} />
            <div className="grid gap-5 md:grid-cols-2">
              <Reveal className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                <h3 className="mb-2 font-serif text-lg font-black uppercase text-slate-900">What it is</h3>
                <p className="leading-relaxed text-slate-600">{detail.intro.what}</p>
                <h3 className="mb-2 mt-6 font-serif text-lg font-black uppercase text-slate-900">Why your business needs it</h3>
                <p className="leading-relaxed text-slate-600">{detail.intro.why}</p>
              </Reveal>
              <div className="grid gap-5">
                <Reveal delay={0.08} className="rounded-3xl bg-primary p-6 text-white shadow-lg shadow-primary/20 sm:p-7">
                  <h3 className="mb-3 font-serif text-lg font-black uppercase">Problems it solves</h3>
                  <ul className="space-y-2.5">
                    {detail.intro.problems.map((p) => (
                      <li key={p} className="flex gap-2.5 text-sm text-blue-50"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{p}</li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delay={0.16} className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg sm:p-7">
                  <h3 className="mb-3 font-serif text-lg font-black uppercase">Who needs it</h3>
                  <ul className="space-y-2.5">
                    {detail.intro.who.map((p) => (
                      <li key={p} className="flex gap-2.5 text-sm text-slate-200"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />{p}</li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── B. What I provide ── */}
        <section className="px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <SectionHead eyebrow="Deliverables" title={<>What I <span className="text-gradient">provide</span></>} />
            <div className="grid gap-4 sm:grid-cols-2">
              {detail.provide.map((item, i) => (
                <Reveal key={item} delay={(i % 2) * 0.06} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><CheckCircle2 className="h-4 w-4" /></span>
                  <span className="pt-1 text-sm font-semibold leading-snug text-slate-800 sm:text-base">{item}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── C. Working process ── */}
        <section className="px-4 py-14">
          <div className="mx-auto max-w-3xl">
            <SectionHead eyebrow="How we work" title={<>My working <span className="text-gradient">process</span></>} />
            <ol className="relative space-y-5 before:absolute before:left-[23px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-gradient-to-b before:from-primary before:to-primary/10 sm:before:left-[27px]">
              {detail.process.map((s, i) => (
                <Reveal key={s.title} className="relative flex gap-4 sm:gap-5">
                  <span className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-lg font-black text-white shadow-lg shadow-primary/30 ring-4 ring-white sm:h-14 sm:w-14">{i + 1}</span>
                  <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                    <h3 className="font-serif text-base font-black uppercase tracking-tight text-slate-900 sm:text-lg">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ── D. Tools & technologies ── */}
        <section className="px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <SectionHead eyebrow="My toolkit" title={<>Tools & <span className="text-gradient">technologies</span></>} />
            <Reveal className="flex flex-wrap justify-center gap-x-4 gap-y-7">
              {detail.tools.map((t) => <ToolBadge key={t.label} t={t} />)}
            </Reveal>
          </div>
        </section>

        {/* ── E. Timeline ── */}
        <section className="px-4 py-14">
          <div className="mx-auto max-w-4xl">
            <SectionHead eyebrow="Delivery" title={<>Project <span className="text-gradient">timeline</span></>} />
            <div className="grid gap-4 sm:grid-cols-3">
              {detail.timeline.map((t, i) => (
                <Reveal key={t.label} delay={i * 0.08} className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                  <Clock className="mx-auto mb-3 h-7 w-7 text-primary" />
                  <p className="font-mono text-xl font-extrabold text-slate-900">{t.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{t.label}</p>
                </Reveal>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">Estimates — the exact schedule is confirmed in your quotation.</p>
          </div>
        </section>

        {/* ── F. Why choose me ── */}
        <section className="px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <SectionHead eyebrow="The difference" title={<>Why choose <span className="text-gradient">me</span></>} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_CHOOSE_ME.map((w, i) => {
                const Icon = whyIcons[i];
                return (
                  <Reveal key={w.title} delay={(i % 3) * 0.07} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></span>
                    <h3 className="font-serif text-base font-black uppercase text-slate-900">{w.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{w.desc}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Pricing & payment ── */}
        <section id="book" className="scroll-mt-24 px-4 pb-24 pt-14">
          <div className="mx-auto max-w-4xl">
            <SectionHead eyebrow="Pricing & payment" title={<>Your <span className="text-gradient">quotation</span></>} />
            <Reveal className="overflow-hidden rounded-[28px] bg-slate-900 text-white shadow-2xl shadow-slate-900/25">
              <div className="grid md:grid-cols-5">
                <div className="p-6 sm:p-9 md:col-span-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">Service</p>
                  <h3 className="mt-1 font-serif text-2xl font-black uppercase tracking-tight">{price.title}</h3>
                  <p className="mt-3 text-sm text-slate-300">Starting price <span className="font-mono font-extrabold text-white">{formatINR(price.startingPrice)}{price.unit}</span></p>
                  <p className="mt-1 text-sm text-slate-300">Estimated delivery <span className="font-semibold text-white">{detail.delivery}</span></p>

                  <p className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">Starting price includes</p>
                  <ul className="space-y-2">
                    {detail.included.map((x) => (
                      <li key={x} className="flex gap-2.5 text-sm text-slate-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />{x}</li>
                    ))}
                  </ul>

                  <label htmlFor="total" className="mb-2 mt-7 block text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">Your total project cost (₹)</label>
                  <input
                    id="total"
                    inputMode="numeric"
                    value={totalText}
                    onChange={(e) => setTotalText(e.target.value.replace(/[^\d]/g, "").slice(0, 7))}
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-mono text-lg font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20"
                    placeholder={String(price.startingPrice)}
                    aria-invalid={!!totalError}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {detail.quickTotals.map((q) => (
                      <button key={q} type="button" onClick={() => setTotalText(String(q))} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${total === q ? "bg-white text-slate-900" : "bg-white/10 text-slate-200 hover:bg-white/20"}`}>{formatINR(q)}</button>
                    ))}
                  </div>
                  {totalError ? (
                    <p className="mt-2 text-xs font-medium text-amber-300">{totalError}</p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">Final cost is confirmed after we discuss your requirements (max {formatINR(MAX_PROJECT_TOTAL_INR)} online).</p>
                  )}
                </div>

                <div className="bg-gradient-to-b from-primary to-[#0b49b8] p-6 sm:p-9 md:col-span-2">
                  <Wallet className="mb-3 h-7 w-7 text-white/80" />
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-blue-100">Total project cost</dt>
                      <dd className="font-mono text-2xl font-extrabold">{formatINR(quote.total)}</dd>
                    </div>
                    <div className="rounded-2xl bg-white/15 p-4">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-blue-100">{quote.tokenPercent}% Booking Token — pay now</dt>
                      <dd className="font-mono text-3xl font-extrabold">{formatINR(quote.token)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-blue-100">Additional advance at project start ({quote.startPercent}%)</dt>
                      <dd className="font-mono text-xl font-bold">{formatINR(quote.startAdvance)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-blue-100">Remaining after completion ({quote.remainingPercent}%)</dt>
                      <dd className="font-mono text-xl font-bold">{formatINR(quote.remaining)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Reveal>

            <Reveal className="mt-8 flex flex-col items-center gap-3">
              <button
                type="button"
                disabled={!!totalError}
                onClick={() => setBookingOpen(true)}
                className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-8 pr-2 text-base font-bold text-white shadow-xl shadow-primary/35 transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                Book Now
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary transition group-hover:translate-x-0.5"><ArrowRight className="h-5 w-5" /></span>
              </button>
              <p className="flex items-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 text-primary" /> Secure payment · Pay only the booking token now</p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />

      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} slug={detail.slug as ServiceSlug} serviceTitle={price.title} quote={quote} />
    </motion.div>
  );
}
