"use client";

import { useNillion } from "@/hooks/useNillion";
import { useSessionQuery } from "@/hooks/useSessionQuery";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { state } = useNillion();
  const { isSuccess: isSessionReady, isLoading } = useSessionQuery();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  const isAuthenticated = state.wallets.isMetaMaskConnected && isSessionReady;
  const isCheckingAuth = !hasChecked || isLoading || (state.wallets.isMetaMaskConnected && !isSessionReady);

  useEffect(() => {
    // Give time for initial state to load
    const timer = setTimeout(() => {
      setHasChecked(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect if we've checked and user is definitely not authenticated
    if (hasChecked && !state.wallets.isMetaMaskConnected && !state.signer && !isLoading) {
      router.push("/");
    }
  }, [hasChecked, state.wallets.isMetaMaskConnected, state.signer, isLoading, router]);

  // Still checking authentication state
  if (isCheckingAuth) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 animate-pulse">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
            Authenticating...
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Please wait while we verify your session
          </p>
        </div>
      </div>
    );
  }

  // Authentication check complete - show content if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Not authenticated and check is complete - will redirect
  return null;
}

