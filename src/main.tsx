import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { NetworkToast } from "./components/NetworkToast.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY env var");
if (!import.meta.env.VITE_API_BASE_URL) throw new Error("Missing VITE_API_BASE_URL env var");

function handleGlobalError(error: unknown) {
  const err = error as { type?: string; message?: string };
  if (err?.type === "NETWORK_ERROR" || !navigator.onLine) {
    return; // NetworkToast handles this
  }
  if (err?.type === "SERVER_ERROR" || err?.type === "INTERNAL_SERVER_ERROR") {
    toast.error("Server error", {
      description: err.message || "Something went wrong on our end. Please try again.",
    });
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => handleGlobalError(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => handleGlobalError(error),
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const err = error as { type?: string };
        // Don't retry on auth or validation errors
        if (err?.type === "UNAUTHORIZED" || err?.type === "VALIDATION_ERROR" || err?.type === "NOT_FOUND" || err?.type === "RATE_LIMITED" || err?.type === "SUBSCRIPTION_ERROR") {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <BrowserRouter>
            <App />
            <NetworkToast />
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </ErrorBoundary>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
);

