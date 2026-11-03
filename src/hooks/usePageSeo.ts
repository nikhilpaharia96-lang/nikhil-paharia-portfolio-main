import { useEffect } from "react";

interface Seo {
  title: string;
  description: string;
  /** Path such as "/services/video-editing" — turned into an absolute canonical URL. */
  path: string;
  /** schema.org JSON-LD object(s) to embed. */
  jsonLd?: Record<string, unknown>;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Client-side per-page SEO for the SPA: title, description, canonical, Open Graph / Twitter tags
 * and JSON-LD. Restores the previous values when the page unmounts.
 */
export function usePageSeo({ title, description, path, jsonLd }: Seo) {
  useEffect(() => {
    const prevTitle = document.title;
    const url = `${window.location.origin}${path}`;
    const prev = new Map<string, string | null>();
    const remember = (attr: "name" | "property", key: string) =>
      prev.set(`${attr}:${key}`, document.head.querySelector(`meta[${attr}="${key}"]`)?.getAttribute("content") ?? null);

    const metas: ["name" | "property", string, string][] = [
      ["name", "description", description],
      ["property", "og:title", title],
      ["property", "og:description", description],
      ["property", "og:url", url],
      ["property", "og:type", "website"],
      ["name", "twitter:title", title],
      ["name", "twitter:description", description],
    ];
    metas.forEach(([a, k]) => remember(a, k));

    document.title = title;
    metas.forEach(([a, k, v]) => setMeta(a, k, v));

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const hadCanonical = !!canonical;
    const prevHref = canonical?.getAttribute("href") ?? null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = prevTitle;
      metas.forEach(([a, k]) => {
        const old = prev.get(`${a}:${k}`);
        if (old === null || old === undefined) document.head.querySelector(`meta[${a}="${k}"]`)?.remove();
        else setMeta(a, k, old);
      });
      if (hadCanonical && prevHref) canonical!.href = prevHref;
      else canonical?.remove();
      script?.remove();
    };
  }, [title, description, path, jsonLd]);
}
