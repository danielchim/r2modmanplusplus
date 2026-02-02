import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { vitePluginVersion } from "./scripts/vite-plugin-version.js"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vitePluginVersion(),
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/thunderstore": {
        target: "https://thunderstore.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/thunderstore/, "/api/cyberstorm"),
        secure: true,
      },
    },
  },
})
