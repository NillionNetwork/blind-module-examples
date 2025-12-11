import { useCallback, useState } from "react";

const META_MASK_KEY = "nillion_hasConnectedMetaMask";
const ROOT_TOKEN_KEY = "nillion_rootToken";
const NILDB_TOKENS_KEY = "nillion_nildbTokens";

export function usePersistedConnection() {
  const [hasConnected, setHasConnected] = useState(() => {
    try {
      return {
        metaMask: localStorage.getItem(META_MASK_KEY) === "true",
      };
    } catch {
      return { metaMask: false };
    }
  });

  const setMetaMaskConnected = useCallback(() => {
    try {
      localStorage.setItem(META_MASK_KEY, "true");
      setHasConnected((prev) => ({ ...prev, metaMask: true }));
    } catch (e) {
      console.error("Failed to write to localStorage", e);
    }
  }, []);

  const getStoredRootToken = useCallback((): string | null => {
    try {
      return localStorage.getItem(ROOT_TOKEN_KEY);
    } catch {
      return null;
    }
  }, []);

  const setStoredRootToken = useCallback((token: string) => {
    try {
      localStorage.setItem(ROOT_TOKEN_KEY, token);
    } catch (e) {
      console.error("Failed to write root token to localStorage", e);
    }
  }, []);

  const getStoredNildbTokens = useCallback((): Record<string, string> | null => {
    try {
      const item = localStorage.getItem(NILDB_TOKENS_KEY);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }, []);

  const setStoredNildbTokens = useCallback((tokens: Record<string, string>) => {
    try {
      localStorage.setItem(NILDB_TOKENS_KEY, JSON.stringify(tokens));
    } catch (e) {
      console.error("Failed to write nildb tokens to localStorage", e);
    }
  }, []);

  const clearAll = useCallback(() => {
    try {
      localStorage.removeItem(META_MASK_KEY);
      localStorage.removeItem(ROOT_TOKEN_KEY);
      localStorage.removeItem(NILDB_TOKENS_KEY);
      setHasConnected({ metaMask: false });
    } catch (e) {
      console.error("Failed to clear localStorage", e);
    }
  }, []);

  const hasStoredSession = !!getStoredRootToken() && !!getStoredNildbTokens();

  return {
    hasConnected,
    setMetaMaskConnected,
    getStoredRootToken,
    setStoredRootToken,
    getStoredNildbTokens,
    setStoredNildbTokens,
    clearAll,
    hasStoredSession,
  };
}

