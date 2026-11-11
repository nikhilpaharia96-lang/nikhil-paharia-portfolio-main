import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "np-theme";

/** Saved choice, else the visitor's OS preference. */
export function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* storage blocked */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#050b18" : "#f8fbff");
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light",
  );

  useEffect(() => {
    const sync = () => setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light");
    window.addEventListener("np-theme-change", sync);
    return () => window.removeEventListener("np-theme-change", sync);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("np-theme-change"));
  }, []);

  const toggle = useCallback(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
  }, [setTheme]);

  return { theme, setTheme, toggle };
}
