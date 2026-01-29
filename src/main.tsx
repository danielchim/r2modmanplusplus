import { StrictMode, lazy, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { QueryClientProvider } from "@tanstack/react-query"

import "./index.css"
import { createRouter } from "./router"
import { AppBootstrap } from "./components/app-bootstrap"
import { queryClient } from "./lib/query-client"
import { TRPCProvider } from "./lib/trpc"

const router = createRouter()

const rootEl = document.getElementById("root")
if (!rootEl) throw new Error("Root element not found")

// Only load dev tools in development (bundle-defer-third-party)
if (import.meta.env.DEV) {
  // Dynamically import react-scan after initial render
  import("react-scan").then(({ scan }) => {
    scan({ enabled: true })
  })
}

// Lazy load React Query Devtools (bundle-defer-third-party)
const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((m) => ({
    default: m.ReactQueryDevtools,
  }))
)

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient}>
        <AppBootstrap />
        <RouterProvider router={router} />
        {import.meta.env.DEV && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </TRPCProvider>
    </QueryClientProvider>
  </StrictMode>
)
