import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { scan } from "react-scan"; // must be imported before React and React DOM

import "./index.css"
import { createRouter } from "./router"
import { AppBootstrap } from "./components/app-bootstrap"

const router = createRouter()

const rootEl = document.getElementById("root")
if (!rootEl) throw new Error("Root element not found")
scan({
  enabled: true,
});

createRoot(rootEl).render(
  <StrictMode>
    <AppBootstrap />
    <RouterProvider router={router} />
  </StrictMode>
)
