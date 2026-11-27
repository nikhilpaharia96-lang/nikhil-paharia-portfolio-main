import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePageSeo } from "@/hooks/usePageSeo";
import { SERVICE_PRICES, SERVICE_SLUGS, formatINR } from "../../shared/servicePricing";

const WA = `https://wa.me/919395722454?text=${encodeURIComponent("Hi Nikhil, I'm from Guwahati and I'd like a free quote.")}`;

const TITLE = "Web Developer, Video Editor & Digital Marketer in Guwahati | Nikhil Paharia";
const DESC =
  "Websites, video editing, digital marketing, chatbots and online stores for businesses in Guwahati and Assam. Clear prices from ₹499. Free quote on WhatsApp.";

export default function Guwahati() {
  usePageSeo({
    title: TITLE,
    description: DESC,
    path: "/guwahati",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: "Nikhil Paharia — Web Development, Video Editing & Digital Marketing",
      url: "https://www.nikhilpaharia.online/guwahati",
      telephone: "+919395722454",
      areaServed: [
        { "@type": "City", name: "Guwahati" },
        { "@type": "AdministrativeArea", name: "Assam" },
      ],
    },
  });

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:pt-32">
        <h1 className="font-serif text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
          Web developer, video editor &amp; digital marketer for businesses in Guwahati
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          I help shops, clinics, institutes, creators and startups in Guwahati and across Assam get found online and
          turn visitors into WhatsApp enquiries. One person for your website, videos and ads, with the price shared
          before you pay anything.
        </p>

        <a
          href={WA}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:brightness-110"
        >
          Get a Free Quote on WhatsApp
        </a>

        <h2 className="mt-12 font-serif text-2xl font-black text-slate-900">Services and starting prices</h2>
        <ul className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-sm">
          {SERVICE_SLUGS.map((slug) => {
            const s = SERVICE_PRICES[slug];
            return (
              <li key={slug}>
                <Link href={`/services/${slug}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-blue-50/50">
                  <span className="font-bold text-slate-800">{s.title}</span>
                  <span className="font-mono text-sm font-bold text-primary">from {formatINR(s.startingPrice)}{s.unit}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <h2 className="mt-12 font-serif text-2xl font-black text-slate-900">How it works</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-600">
          <li>Message me on WhatsApp with what you need.</li>
          <li>I send a clear quote and timeline.</li>
          <li>You approve it, I start, and you see progress along the way.</li>
        </ol>
      </main>
      <Footer />
    </div>
  );
}
