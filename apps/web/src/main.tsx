import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./lib/trpc";
import App from "./App";
import "./index.css";
import "./i18n/index";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 2 } },
});

const trpcClient = trpc.createClient({
  links: [httpBatchLink({
    url: `${import.meta.env.VITE_API_URL || "http://localhost:8787"}/trpc`,
    headers: () => {
      const token = localStorage.getItem("listify_token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  })],
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);
