import "../vite.polyfills";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";

import App from "@/App.tsx";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { Toaster } from "@/components/ui/toaster.tsx";
import { WalletProvider } from "@/components/WalletProvider.tsx";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";

const queryClient = new QueryClient();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <WalletProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <WrongNetworkAlert />
          <Toaster />
          <Analytics />
        </QueryClientProvider>
      </WalletProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
);
