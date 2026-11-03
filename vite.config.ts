import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// PORT / BASE_PATH are still honoured when provided (e.g. by a hosting platform),
// but default sensibly so `npm run dev` / `npm run build` work standalone.
const port = Number(process.env.PORT) || 5173;
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: { port, host: "0.0.0.0", allowedHosts: true },
  preview: { port, host: "0.0.0.0", allowedHosts: true },
});
