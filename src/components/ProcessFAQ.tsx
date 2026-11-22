import { MessageCircle, FileText, Rocket, CheckCircle2, ArrowRight } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { waLink } from "@/lib/contact";

/* Facts below mirror shared/serviceInfo.ts, shared/servicePricing.ts and the Contact section. */

const steps = [
  { Icon: MessageCircle, title: "Tell me your idea", text: "Message me on WhatsApp or use the form. A short description of what you need is enough." },
  { Icon: FileText, title: "Get a clear quote", text: "You get the price and delivery time up front, with what is included. Free consultation." },
  { Icon: Rocket, title: "Book and start", text: "Pay a small 5% booking token to reserve your slot. Work begins after the 25% start advance." },
  { Icon: CheckCircle2, title: "Review and receive", text: "You review the work, request changes, then pay the 70% balance on completion and receive the final files." },
];

const faqs = [
  {
    q: "How much will my project cost?",
    a: "Prices start at ₹2,999 for websites, ₹499 for video editing and graphic design, ₹1,499 for UI/UX, ₹1,999/month for digital marketing and ₹4,999 for automation and e-commerce. The exact price depends on your requirements, and I share it before you pay anything.",
  },
  {
    q: "How long does it take?",
    a: "A landing page takes 3–5 days and a business website (5–8 pages) 7–12 days. A reel takes 1–2 days, a YouTube video 3–5 days, and a logo 3–5 days. Bigger projects like custom web apps take 3–6 weeks.",
  },
  {
    q: "How does payment work?",
    a: "A 5% booking token reserves your slot, 25% is paid when the project starts and the remaining 70% when the work is completed. You can also send an enquiry without paying anything first.",
  },
  {
    q: "Can I ask for changes?",
    a: "Yes. Every starting package includes 1 round of revisions. If you need more, tell me and we will agree on it before work starts.",
  },
  {
    q: "How quickly will you reply?",
    a: "Usually within 24–48 hours. WhatsApp is the fastest way to reach me.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Your details and project ideas stay confidential and are only used to prepare your quote and deliver the work.",
  },
];

export default function ProcessFAQ() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" className="section-padding relative" aria-label="How it works and frequently asked questions">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-tight relative z-10">
        {/* Process */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="section-title mb-4 inline-block">
            How it <span className="text-gradient">Works</span>
          </h2>
          <div className="section-divider mx-auto" />
          <p className="mt-4 mx-auto max-w-xl text-sm sm:text-base text-slate-600">
            Four simple steps from your first message to the finished work.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-16 sm:mb-20">
          {steps.map(({ Icon, title, text }, i) => (
            <li
              key={title}
              className="relative rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_18px_40px_-22px_rgba(18,102,241,0.35)]"
            >
              <span className="absolute right-5 top-4 text-5xl font-black text-primary/10 select-none" aria-hidden="true">
                {i + 1}
              </span>
              <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-[#1266F1]">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-base font-bold text-[#0b1530]">
                <span className="sr-only">Step {i + 1}: </span>
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </li>
          ))}
        </ol>

        {/* FAQ */}
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="section-title mb-4 inline-block">
              Common <span className="text-gradient">Questions</span>
            </h2>
            <div className="section-divider mx-auto" />
          </div>

          <Accordion type="single" collapsible className="rounded-3xl border border-blue-100 bg-white/90 px-5 sm:px-7 shadow-[0_18px_40px_-22px_rgba(18,102,241,0.35)]">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`} className="border-blue-100">
                <AccordionTrigger className="py-5 text-left text-[15px] sm:text-base font-semibold text-[#0b1530] hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm sm:text-[15px] leading-relaxed text-slate-600">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600 mb-4">Still have a question? Ask me directly.</p>
            <a
              href={waLink("Hi Nikhil, I have a question about your services.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-300"
            >
              <SiWhatsapp className="h-5 w-5" aria-hidden="true" />
              Ask on WhatsApp
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
