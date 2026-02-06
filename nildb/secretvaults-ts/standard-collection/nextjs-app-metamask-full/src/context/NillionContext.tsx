// src/context/NillionContext.tsx
"use client";

import { Signer } from "@nillion/nuc";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createWalletClient, custom, type TypedDataDomain } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { AuthFlowManager } from "@/context/AuthFlowManager";
import { useLogContext } from "@/context/LogContext";
import { usePersistedConnection } from "@/hooks/usePersistedConnection";
import type { NillionState } from "./NillionState";

// Extend Window interface to include ethereum property (MetaMask/Wallets)
declare global {
  interface Window {
    ethereum?: any & {
      providers?: any[];
      isMetaMask?: boolean;
    };
  }
}

interface INillionContext {
  state: NillionState;
  connectMetaMask: () => Promise<void>;
  logout: () => void;
}

export const NillionContext = createContext<INillionContext | null>(null);

const initialState: NillionState = {
  signer: null,
  did: null,
  wallets: {
    isMetaMaskConnected: false,
    metaMaskAddress: null,
  },
};

export function NillionProvider({ children }: { children: ReactNode }) {
  const { log, clearLogs } = useLogContext();
  const [state, setState] = useState<NillionState>(initialState);
  const {
    hasConnected,
    setMetaMaskConnected,
    clearAll: clearPersistedConnection,
  } = usePersistedConnection();
  const reconnectIdempotencyRef = useRef(false);
  const queryClient = useQueryClient();

  const connectMetaMask = useCallback(async () => {
    log("🔌 Connecting to MetaMask...");
    if (!window.ethereum) {
      return log("❌ MetaMask is not installed.");
    }
    try {
      const eth: any = window.ethereum as any;
      const metaMaskProvider = (eth?.providers?.find((p: any) => p?.isMetaMask) ?? eth) as typeof window.ethereum;

      // Detect active chain and align client to avoid chainId mismatch errors
      const chainIdHex = await metaMaskProvider.request({ method: "eth_chainId" });
      const activeChainId = Number(chainIdHex);
      const activeChain = activeChainId === 1 ? mainnet : activeChainId === 11155111 ? sepolia : mainnet;

      const walletClient = createWalletClient({
        chain: activeChain,
        transport: custom(metaMaskProvider),
      });
      const [account] = await walletClient.requestAddresses();

      const nucSigner = Signer.fromWeb3({
        getAddress: async () => account,
        signTypedData: async ({ domain, types, primaryType, message }) => {
          const normalizedDomain: any = { ...domain };
          // If the domain specifies a chainId, switch to it before signing
          const domainChainId = Number(normalizedDomain?.chainId);
          if (!Number.isNaN(domainChainId) && domainChainId !== activeChainId) {
            try {
              const hex = `0x${domainChainId.toString(16)}`;
              await metaMaskProvider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: hex }],
              });
            } catch (switchErr) {
              // If switching fails, try signing anyway
            }
          }
          return walletClient.signTypedData({
            account,
            domain: normalizedDomain as TypedDataDomain | undefined,
            types,
            primaryType,
            message,
          });
        },
      });

      const did = await nucSigner.getDid();
      setState((prev) => ({
        ...prev,
        signer: nucSigner,
        did: did.didString,
        wallets: {
          ...prev.wallets,
          isMetaMaskConnected: true,
          metaMaskAddress: account,
        },
      }));
      setMetaMaskConnected();
      log(`✅ MetaMask connected: ${account}`);
    } catch (e: unknown) {
      const err = e as any;
      const code = err?.code ? ` (code ${err.code})` : "";
      const details = err?.data?.message || err?.message || String(err);
      log("❌ MetaMask connection failed." + code, details);
    }
  }, [log, setMetaMaskConnected]);

  const logout = useCallback(() => {
    setState(initialState);
    clearPersistedConnection();
    queryClient.removeQueries({ queryKey: ["session"] });
    queryClient.removeQueries({ queryKey: ["subscriptionStatus"] });
    queryClient.removeQueries({ queryKey: ["builderProfile"] });
    clearLogs("🔌 Session disconnected.");
  }, [clearPersistedConnection, clearLogs, queryClient]);

  // Auto-reconnect effect (only run once on mount)
  useEffect(() => {
    if (reconnectIdempotencyRef.current) return;
    reconnectIdempotencyRef.current = true;

    const reconnect = async () => {
      if (hasConnected.metaMask && !state.wallets.isMetaMaskConnected) {
        await connectMetaMask();
      }
    };
    reconnect().catch(console.error);
  }, [
    connectMetaMask,
    hasConnected.metaMask,
    state.wallets.isMetaMaskConnected,
  ]);

  const contextValue = useMemo(
    () => ({
      state,
      connectMetaMask,
      logout,
    }),
    [state, connectMetaMask, logout],
  );

  return (
    <NillionContext.Provider value={contextValue}>
      <AuthFlowManager />
      {children}
    </NillionContext.Provider>
  );
}
