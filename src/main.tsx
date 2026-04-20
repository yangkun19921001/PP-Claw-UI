import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./app";
import "./index.css";
import { I18nProvider } from "@/lib/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <App />
          <Toaster position="top-right" richColors />
        </HashRouter>
      </QueryClientProvider>
    </I18nProvider>
  </StrictMode>,
);
