import type { Signer } from "@nillion/nuc";

export interface NillionState {
  signer: Signer | null;
  did: string | null;
  wallets: {
    isMetaMaskConnected: boolean;
    metaMaskAddress: string | null;
  };
}

