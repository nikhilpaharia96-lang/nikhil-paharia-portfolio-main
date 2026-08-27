import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    // Split heavy vendor libraries into their own cacheable chunks instead of
    // one monolithic bundle. Three.js/gsap/swiper are large and only needed
    // by specific below-the-fold sections (which are already React.lazy'd),
    // so isolating them keeps the critical-path JS small on mobile networks.
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("three")) return "vendor-three";
          if (id.includes("gsap")) return "vendor-gsap";
          if (id.includes("swiper")) return "vendor-swiper";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          return undefined; // everything else (react, radix-ui, etc.) stays in Vite's default vendor chunk
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
  },
  preview: {
    port: 5173,
    host: "0.0.0.0",
  },
});