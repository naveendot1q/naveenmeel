import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// PORT — required for Replit dev server, optional elsewhere (Vercel build ignores it)
const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;
if (rawPort && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// BASE_PATH — defaults to "/" for Vercel/standalone, set by Replit for path-based routing
const basePath = process.env.BASE_PATH ?? "/";

const isReplit = process.env.REPL_ID !== undefined;
const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  base: basePath,
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
        orientation: "portrait-primary",
        icons: [
          {
            src: "naveen.jpg",
            sizes: "192x192",
            type: "image/jpeg",
          },
          {
            src: "naveen.jpg",
            sizes: "512x512",
            type: "image/jpeg",
          },
          {
            src: "naveen.jpg",
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,ico,woff,woff2}"],
        runtimeCaching: [
          // Google Fonts — cache first, 1 year
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // API calls — network first (fresh data when online, cached when offline)
          {
            urlPattern: /\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-responses",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 8,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Images in public folder — cache first
          {
            urlPattern: /\.(?:jpg|jpeg|png|gif|webp|avif)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
    // Replit-only dev plugins
    ...(isReplit && isDev
      ? [
          (await import("@replit/vite-plugin-runtime-error-modal")).default(),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: { strict: true },
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.API_PORT || 8080}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
