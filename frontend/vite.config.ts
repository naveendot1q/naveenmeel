import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["naveen.jpg", "favicon.svg", "robots.txt"],
      manifest: {
        name: "Naveen Meel — Portfolio & Blog",
        short_name: "Naveen.dev",
        description:
          "NOC Network Engineer at Airtel. Writing about Networking, Cloud, DevOps, Kubernetes, and Terraform.",
        theme_color: "#0d1117",
        background_color: "#0d1117",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "naveen.jpg", sizes: "192x192", type: "image/jpeg" },
          { src: "naveen.jpg", sizes: "512x512", type: "image/jpeg" },
          {
            src: "naveen.jpg",
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
