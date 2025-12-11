"use client";

import { useNillion } from "@/hooks/useNillion";
import { useSessionQuery } from "@/hooks/useSessionQuery";

export default function Home() {
  const { state, connectMetaMask, logout } = useNillion();
  const { isSuccess: isSessionReady } = useSessionQuery();

  const isAuthenticated = state.wallets.isMetaMaskConnected && isSessionReady;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black font-sans">
      <main className="w-full max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 gap-6">
        {/* Left Panel - Auth */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4">
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
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Passwordless Login
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Secure authentication with MetaMask & Nillion
            </p>
          </div>

          {/* Not Authenticated View */}
          {!isAuthenticated ? (
            <div className="space-y-4">
              <button
                onClick={connectMetaMask}
                disabled={state.wallets.isMetaMaskConnected}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {state.wallets.isMetaMaskConnected ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Initializing Session...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm7.563 14.438l-1.687 6.375c-.125.469-.469.594-.938.375l-2.625-1.969-1.313 1.313c-.125.125-.25.25-.5.25l.188-2.625 4.688-4.313c.188-.188-.031-.281-.344-.094L8.75 17.938l-2.5-.813c-.531-.188-.531-.531.094-.813l9.844-3.844c.438-.188.813.094.688.813z" />
                    </svg>
                    Connect with MetaMask
                  </>
                )}
              </button>

              <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                Make sure MetaMask is installed in your browser
              </div>
            </div>
          ) : (
            /* Authenticated View */
            <div className="space-y-6">
              {/* Success Badge */}
              <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Successfully Authenticated
                </span>
              </div>

              {/* User Info */}
              <div className="space-y-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                    Wallet Address
                  </label>
                  <p className="text-sm font-mono text-zinc-900 dark:text-white break-all">
                    {state.wallets.metaMaskAddress}
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                    Nillion DID
                  </label>
                  <p className="text-sm font-mono text-zinc-900 dark:text-white break-all">
                    {state.did}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = "/profile"}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  View Profile →
                </button>
                
                <button
                  onClick={logout}
                  className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Powered by{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Nillion Network
              </span>
            </p>
          </div>
        </div>

        {/* Logs panel removed for simplified quickstart */}
      </main>
    </div>
  );
}
