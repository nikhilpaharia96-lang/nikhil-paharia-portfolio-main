import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { PHONE_TEL, waLink } from "@/lib/contact";
import { track } from "@/lib/analytics";

/**
 * Always-reachable quick contact. Phones: one slim bottom bar (Call, WhatsApp, Free quote).
 * md and up: round WhatsApp button, bottom-left. Appears after a short scroll so it never covers the hero.
 * 48px targets, opacity/transform transitions only (150–250ms), no motion for reduced-motion users.
 */
export default function StickyContact() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waHref = waLink("Hi Nikhil, I found your portfolio and would like to discuss a project.");
  const openQuote = () => {
    track("funnel_launcher_click");
    window.dispatchEvent(new CustomEvent("np:open-funnel"));
  };

  const motion = `transition duration-[250ms] ease-out motion-reduce:transition-none ${
    show ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"
  }`;
  const item =
    "flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40";
  const tab = show ? 0 : -1;

  return (
    <>
      <div
        role="group"
        aria-label="Quick contact"
        aria-hidden={!show}
        className={`fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-blue-100 bg-white/95 px-3 pt-2 backdrop-blur md:hidden ${motion}`}
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        <a href={`tel:${PHONE_TEL}`} tabIndex={tab} className={`${item} border border-blue-200 text-[#1266F1]`}>
          <Phone className="h-4 w-4" aria-hidden="true" /> Call
        </a>
        <a href={waHref} target="_blank" rel="noopener noreferrer" tabIndex={tab} className={`${item} bg-[#25D366] text-[#062b16]`}>
          <SiWhatsapp className="h-4 w-4" aria-hidden="true" /> WhatsApp
        </a>
        <button type="button" onClick={openQuote} tabIndex={tab} className={`${item} bg-[#1266F1] text-white`}>
          Free quote
        </button>
      </div>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        tabIndex={tab}
        className={`fixed left-6 bottom-6 z-40 hidden h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_28px_-8px_rgba(15,45,90,0.55)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 md:grid ${motion}`}
      >
        <SiWhatsapp className="h-6 w-6" aria-hidden="true" />
      </a>
    </>
  );
}
