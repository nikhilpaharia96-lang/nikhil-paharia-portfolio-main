import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { PHONE_TEL, waLink } from "@/lib/contact";

/**
 * Always-reachable quick-contact buttons (bottom-left; the "Free quote" launcher owns bottom-right).
 * WhatsApp everywhere, Call on phones/tablets only. Appears after a short scroll so it never covers the hero.
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

  const base =
    "grid h-12 w-12 place-items-center rounded-full text-white shadow-[0_12px_28px_-8px_rgba(15,45,90,0.55)] transition-transform duration-150 ease-out hover:-translate-y-0.5 active:scale-95 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40";

  return (
    <div
      aria-label="Quick contact"
      className={`fixed left-4 bottom-4 sm:left-6 sm:bottom-6 z-40 flex flex-col gap-3 transition duration-[250ms] ease-out motion-reduce:transition-none ${
        show ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"
      }`}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <a
        href={`tel:${PHONE_TEL}`}
        aria-label="Call Nikhil"
        tabIndex={show ? 0 : -1}
        className={`${base} bg-[#1266F1] md:hidden`}
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
      </a>
      <a
        href={waLink("Hi Nikhil, I found your portfolio and would like to discuss a project.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        tabIndex={show ? 0 : -1}
        className={`${base} bg-[#25D366]`}
      >
        <SiWhatsapp className="h-6 w-6" aria-hidden="true" />
      </a>
    </div>
  );
}
