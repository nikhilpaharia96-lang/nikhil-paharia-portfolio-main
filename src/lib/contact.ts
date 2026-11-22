/** Single place for the public contact details used by the quick-contact buttons, FAQ and service cards. */
export const WHATSAPP_NUMBER = "919395722454"; // no "+", no spaces — required for wa.me links
export const PHONE_DISPLAY = "+91 93957 22454";
export const PHONE_TEL = "+919395722454";

/** wa.me link with a prefilled message. */
export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
