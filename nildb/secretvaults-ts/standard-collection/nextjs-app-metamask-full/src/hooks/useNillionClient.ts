import type { SecretVaultBuilderClient } from "@nillion/secretvaults";
import { useSessionQuery } from "./useSessionQuery";

interface NillionClientHook {
  nillionClient: SecretVaultBuilderClient;
  nildbTokens: Record<string, string>;
}

export function useNillionClient(): NillionClientHook | null {
  const { data: session, isSuccess } = useSessionQuery();

  if (!isSuccess || !session?.nillionClient || !session?.nildbTokens) {
    return null;
  }

  return {
    nillionClient: session.nillionClient as SecretVaultBuilderClient,
    nildbTokens: session.nildbTokens,
  };
}

