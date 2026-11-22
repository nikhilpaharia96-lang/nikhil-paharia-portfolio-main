import { MessageCircle, FileText, Rocket, CheckCircle2, ArrowRight, HelpCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  return (
    <section id="faq" className="relative py-10 sm:py-14" aria-label="How it works and frequently asked questions">
      <div className="container-tight relative z-10">
        <Dialog>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-3xl border border-blue-100 bg-white/90 px-6 py-7 text-center shadow-[0_18px_40px_-22px_rgba(18,102,241,0.35)] sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="text-lg font-bold text-[#0b1530] sm:text-xl">Not sure how it works?</h2>
              <p className="mt-1 text-sm text-slate-600">Process, pricing, timelines and payment: quick answers in one place.</p>
            </div>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-full bg-[#1266F1] px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
              >
                <HelpCircle className="h-5 w-5" aria-hidden="true" />
                How it Works &amp; FAQ
              </button>
            </DialogTrigger>
          </div>

          <DialogContent className="max-h-[88dvh] w-[calc(100%-1.5rem)] max-w-3xl overflow-y-auto overscroll-contain rounded-3xl border-blue-100 bg-white p-5 sm:p-8">
            <DialogTitle className="text-2xl font-bold text-[#0b1530] sm:text-3xl">
              How it <span className="text-primary">Works</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Four simple steps from your first message to the finished work.
            </DialogDescription>

            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {steps.map(({ Icon, title, text }, i) => (
                <li key={title} className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#1266F1] shadow-sm">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-[#0b1530]">
                      {i + 1}. {title}
                    </span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-slate-600">{text}</span>
                  </span>
                </li>
              ))}
            </ol>

            <h3 className="mt-2 text-xl font-bold text-[#0b1530]">
              Common <span className="text-primary">Questions</span>
            </h3>
            <Accordion type="single" collapsible className="rounded-2xl border border-blue-100 px-4">
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`} className="border-blue-100 last:border-b-0">
                  <AccordionTrigger className="py-4 text-left text-[15px] font-semibold text-[#0b1530] hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed text-slate-600">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="text-center">
              <p className="mb-3 text-sm text-slate-600">Still have a question? Ask me directly.</p>
              <a
                href={waLink("Hi Nikhil, I have a question about your services.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-300"
              >
                <SiWhatsapp className="h-5 w-5" aria-hidden="true" />
                Ask on WhatsApp
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
