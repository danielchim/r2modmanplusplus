import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
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
})
