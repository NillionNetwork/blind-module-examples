import type { SecretVaultBuilderClient } from "@nillion/secretvaults";
import { useQuery } from "@tanstack/react-query";

export interface Session {
  nillionClient: SecretVaultBuilderClient;
  nildbTokens: Record<string, string>;
}

export const useSessionQuery = () => {
  return useQuery<Session>({
    queryKey: ["session"],
    queryFn: () => {
      throw new Error("Session query should be populated manually via queryClient.setQueryData");
    },
    enabled: false,
    staleTime: Infinity,
    retry: false,
  });
};
