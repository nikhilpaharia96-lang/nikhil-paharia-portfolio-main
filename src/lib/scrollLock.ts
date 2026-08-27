/**
 * Reference-counted body-scroll lock.
 *
 * Three different components (Navbar mobile menu, VideoLightbox,
 * SubmitTestimonialModal) each independently did:
 *
 *   const prev = document.body.style.overflow;
 *   document.body.style.overflow = "hidden";
 *   // ...
 *   return () => { document.body.style.overflow = prev; };
 *
 * Independently, each one is correct in isolation. But because they all
 * read/write the same `document.body.style.overflow` with no shared state,
 * two overlapping locks (e.g. opening the video lightbox while the mobile
 * menu's close animation is still unmounting) resolve in whichever order
 * their effects happen to run, and the second cleanup can stomp the value
 * the first one is relying on — leaving `overflow: hidden` on `<body>`
 * permanently after both are closed, which blocks scrolling until reload.
 *
 * This module replaces all three with a single counter: overflow is only
 * ever set once (on the 0 -> 1 transition) and only ever cleared once (on
 * the 1 -> 0 transition), no matter how many lockers are active or in what
 * order they mount/unmount.
 */
let lockCount = 0;
let previousOverflow = "";

export function lockBodyScroll(): () => void {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released) return; // guard against double-invocation (e.g. React StrictMode)
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.overflow = previousOverflow;
    }
  };
}
