import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { vitePluginVersion } from "./scripts/vite-plugin-version.js"

export default defineConfig(({ command }) => {
  return {
    main: {
      plugins: [externalizeDepsPlugin(), vitePluginVersion()],
      build: {
        outDir: "out/main",
        rollupOptions: {
          input: path.resolve(__dirname, "electron/main.ts"),
          output: {
            entryFileNames: "index.js",
          },
        },
      },
    },
    preload: {
      plugins: [
        externalizeDepsPlugin({
          exclude: ["electron-trpc-experimental"],
        }),
      ],
      build: {
        outDir: "out/preload",
        rollupOptions: {
          input: path.resolve(__dirname, "electron/preload.ts"),
          output: {
            entryFileNames: "index.js",
            format: "cjs",
          },
        },
      },
    },
    renderer: {
      root: ".",
      // Use relative base for production builds (Electron file:// protocol)
      // Keep "/" for dev mode (Vite dev server)
      base: command === "build" ? "./" : "/",
      publicDir: "public",
      build: {
        outDir: "out/renderer",
        rollupOptions: {
          input: path.resolve(__dirname, "index.html"),
        },
      },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      plugins: [
        vitePluginVersion(),
        TanStackRouterVite({
          target: "react",
          autoCodeSplitting: true,
        }),
        react(),
        tailwindcss(),
      ],
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
    },
  }
})
