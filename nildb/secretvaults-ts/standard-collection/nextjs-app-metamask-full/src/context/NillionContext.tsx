// src/context/NillionContext.tsx
"use client";

import { Signer } from "@nillion/nuc";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createWalletClient, custom } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { AuthFlowManager } from "@/context/AuthFlowManager";
import { NETWORK_CONFIG } from "@/config";
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

      const targetChainId = Number(NETWORK_CONFIG.walletChainId) || 11155111;
      const targetChainHex = `0x${targetChainId.toString(16)}`;
      const targetChain =
        targetChainId === 1 ? mainnet : targetChainId === 11155111 ? sepolia : mainnet;

      try {
        await metaMaskProvider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainHex }],
        });
      } catch {
        // verify below
      }

      const chainIdHex = (await metaMaskProvider.request({ method: "eth_chainId" })) as string;
      const activeChainId = Number.parseInt(chainIdHex, 16);
      if (activeChainId !== targetChainId) {
        throw new Error(`Wrong wallet chain. Expected ${targetChainId}, got ${chainIdHex}.`);
      }

      const [rawAccount] = (await metaMaskProvider.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (!rawAccount) {
        throw new Error("No MetaMask account available.");
      }
      const account = rawAccount as `0x${string}`;

      const walletClient = createWalletClient({
        chain: targetChain,
        transport: custom(metaMaskProvider),
      });
      const nucSigner = Signer.fromWeb3(
        {
          getAddress: async () => account,
          signTypedData: async (params) =>
            walletClient.signTypedData({ ...params, account }),
        },
        { chainId: targetChainId },
      );

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
