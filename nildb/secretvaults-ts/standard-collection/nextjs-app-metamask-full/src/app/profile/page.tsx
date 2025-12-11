"use client";

import { useNillion } from "@/hooks/useNillion";
import { useProfile } from "@/hooks/useProfile";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Notes } from "@/components/Notes";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { state, logout } = useNillion();
  const { profile, collections, queries, isLoading, isError, error } = useProfile();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
        {/* Header */}
        <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
              Nillion + MetaMask Demo
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* User Info Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Your Profile
              </h2>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                Connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  DID
                </label>
                <p className="text-sm font-mono text-zinc-900 dark:text-white break-all">
                  {state.did}
                </p>
              </div>
            </div>
          </div>

          {/* Builder Profile Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
              Builder Profile
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : isError ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error instanceof Error ? error.message : "Failed to load profile"}
                </p>
              </div>
            ) : profile ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {collections.length}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">Collections</div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {queries.length}
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">Queries</div>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {profile.name || "Demo Builder"}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Name</div>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {new Date(profile._created).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Created</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No profile data available
              </p>
            )}
          </div>

          {/* Notes CRUD Demo */}
          <Notes />
        </main>
      </div>
    </ProtectedRoute>
  );
}
