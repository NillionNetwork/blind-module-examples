import type { SecretVaultBuilderClient } from "@nillion/secretvaults";
import { useQuery } from "@tanstack/react-query";
import { useSessionQuery } from "./useSessionQuery";

export const useBuilderProfileQuery = () => {
  const { data: session, isSuccess: isSessionReady } = useSessionQuery();

  return useQuery({
    queryKey: ["builderProfile"],
    queryFn: async () => {
      if (!session?.nillionClient || !session?.nildbTokens) {
        throw new Error("Session not ready");
      }
      console.log("[useBuilderProfileQuery] fetching profile, tokens:", Object.keys(session.nildbTokens).length);
      const nillionClient = session.nillionClient as SecretVaultBuilderClient;
      return await nillionClient.readProfile({
        auth: { invocations: session.nildbTokens },
      });
    },
    enabled: isSessionReady,
    retry: false,
    staleTime: 30000,  // Don't refetch for 30 seconds
  });
};

