import { useEffect, type RefObject } from "react";

/**
 * Draws attention to the Name field the first time the Contact form scrolls into view, and — only where it is
 * safe and polite — moves focus there so the browser's own autofill UI can be offered.
 *
 * Hard rules (all enforced below):
 *  - Fires at most ONCE per page load: the observer is disconnected after the first trigger, so scrolling up and
 *    down never repeats it.
 *  - The highlight is purely visual (a data attribute that removes itself). It never fills, fakes or reads any value.
 *  - Focus is requested only when ALL of these hold: a precise hover-capable pointer (desktop — never touch
 *    devices, so a mobile keyboard is never forced open), the visitor has already interacted with the page
 *    (`navigator.userActivation.hasBeenActive`, the browser's own gate for this), nobody used the keyboard to get
 *    here (a focus jump would hijack Space/arrow scrolling for keyboard & screen-reader users), nothing else has
 *    focus, and the form is still empty. It uses `preventScroll`, so the page never jumps.
 *  - Saved personal data is never touched by this code. Whether the browser then shows its autofill dropdown, and
 *    when it may fill, remains entirely the browser's decision and needs the visitor's own interaction.
 */
// A data attribute (not a class): React re-renders the input when it gains focus and would overwrite className.
const HINT_ATTR = "data-np-hint";
const HINT_MS = 1800;

export function useContactFormHint(formRef: RefObject<HTMLFormElement>, nameInputId = "contact-name") {
  useEffect(() => {
    const form = formRef.current;
    if (!form || typeof IntersectionObserver === "undefined") return;

    let keyboardUsed = false;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.key === " " || e.key.startsWith("Arrow") || e.key.startsWith("Page")) keyboardUsed = true;
    };
    window.addEventListener("keydown", onKey, { capture: true, passive: true });

    let timer = 0;
    let input: HTMLInputElement | null = null;
    const clearHint = () => {
      window.clearTimeout(timer);
      input?.removeAttribute(HINT_ATTR);
    };

    const nameFullyVisible = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= window.innerHeight && r.width > 0;
    };

    const canFocus = (el: HTMLInputElement): boolean => {
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const activated = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive === true;
      const idle = !document.activeElement || document.activeElement === document.body;
      const untouched = Array.from(form.elements).every((f) => !(f as HTMLInputElement).value);
      return finePointer && activated && !keyboardUsed && idle && untouched && document.visibilityState === "visible" && el.isConnected;
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        const el = form.querySelector<HTMLInputElement>(`#${nameInputId}`);
        if (!el || !nameFullyVisible(el)) return; // wait until the Name field itself is on screen
        io.disconnect(); // once per page load
        window.removeEventListener("keydown", onKey, true);
        if (el.value) return; // already filled (e.g. restored by the browser) — leave it alone

        input = el;
        el.setAttribute(HINT_ATTR, "true");
        el.addEventListener("animationend", clearHint, { once: true });
        timer = window.setTimeout(clearHint, HINT_MS); // covers reduced-motion (no animationend)

        if (canFocus(el)) el.focus({ preventScroll: true });
      },
      { threshold: [0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1] },
    );
    io.observe(form);

    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey, true);
      clearHint();
    };
  }, [formRef, nameInputId]);
}
