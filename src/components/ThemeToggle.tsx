import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

/** Sun / moon switch for the navbar. Icons cross-fade + rotate; respects reduced motion. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      title={dark ? "Light mode" : "Dark mode"}
      className={`theme-toggle relative w-11 h-11 shrink-0 rounded-full border flex items-center justify-center overflow-hidden transition-colors duration-300 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${className}`}
    >
      <Sun
        aria-hidden="true"
        className={`absolute w-5 h-5 transition-all duration-500 motion-reduce:transition-none ${dark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}
      />
      <Moon
        aria-hidden="true"
        className={`absolute w-5 h-5 transition-all duration-500 motion-reduce:transition-none ${dark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}
      />
    </button>
  );
}
