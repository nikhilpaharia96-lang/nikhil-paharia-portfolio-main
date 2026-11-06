/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Microsoft Clarity project ID (falls back to the portfolio's project when unset). */
  readonly VITE_CLARITY_PROJECT_ID?: string;
  /** Comma-separated hostnames allowed to send analytics. Default: nikhilpaharia.online */
  readonly VITE_CLARITY_ALLOWED_HOSTS?: string;
  /** "false" disables Clarity everywhere; "true" forces it on in dev (for local verification). */
  readonly VITE_CLARITY_ENABLED?: string;
  /** "false" disables the anonymous visit-notification email ping (server side is also switchable). */
  readonly VITE_VISIT_NOTIFY_ENABLED?: string;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.mp4" {
  const content: string;
  export default content;
}
