import { Builder, type Command } from "@nillion/nuc";
import { NucCmd, SecretVaultBuilderClient } from "@nillion/secretvaults";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NETWORK_CONFIG } from "@/config";
import { useLogContext } from "@/context/LogContext";
import { useNillion } from "@/hooks/useNillion";
import { usePersistedConnection } from "@/hooks/usePersistedConnection";
import type { Session } from "./useSessionQuery";

async function initializeSession(
  signer: ReturnType<typeof useNillion>["state"]["signer"],
  log: ReturnType<typeof useLogContext>["log"],
): Promise<Session> {
  if (!signer) {
    throw new Error("Signer not available");
  }

  log("⚙️ Initializing clients...");

  const nillionClient = await SecretVaultBuilderClient.from({
    signer,
    dbs: NETWORK_CONFIG.nildb,
    blindfold: { operation: "store" },  // Enable encryption for %allot fields
  });

  log(`🔨 Minting invocation tokens for ${nillionClient.nodes.length} NilDB nodes...`);
  const nildbTokens: Record<string, string> = {};
  for (const node of nillionClient.nodes) {
    nildbTokens[node.id.didString] = await Builder.invocation()
      .subject(await nillionClient.getDid())
      .audience(node.id)
      .command(NucCmd.nil.db.root as Command)
      .expiresIn(86400)
      .signAndSerialize(signer);
  }
  log("✅ All node tokens minted.");

  log("🔍 Checking for existing builder profile...");
  try {
    await nillionClient.readProfile({ auth: { invocations: nildbTokens } });
    log("✅ Builder profile found.");
  } catch (_error) {
    log("ℹ️ No profile found, attempting to register builder...");
    try {
      await nillionClient.register({
        did: (await nillionClient.getDid()).didString,
        name: "Demo Builder",
      });
      log("✅ Builder registered successfully.");
    } catch (registerError: any) {
      const errorMessage = registerError?.message || String(registerError);
      const errorString = JSON.stringify(registerError);
      const errorsArray = registerError?.errors || [];
      const hasDuplicateError =
        errorMessage.includes("DuplicateEntryError") ||
        errorMessage.includes("duplicate") ||
        errorString.includes("DuplicateEntryError") ||
        errorsArray.some((e: any) => String(e).includes("DuplicateEntryError"));
      
      if (hasDuplicateError) {
        log("ℹ️ Builder already registered (duplicate entry) - continuing.");
      } else {
        throw registerError;
      }
    }
  }

  return { nillionClient, nildbTokens };
}

export const useInitializeSessionMutation = () => {
  const { log } = useLogContext();
  const { state } = useNillion();
  const queryClient = useQueryClient();
  const { setStoredNildbTokens } = usePersistedConnection();

  return useMutation({
    mutationFn: () => initializeSession(state.signer, log),
    onSuccess: (data) => {
      log("✅ Session setup complete!");
      queryClient.setQueryData(["session"], data);
      setStoredNildbTokens(data.nildbTokens);
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
      queryClient.invalidateQueries({ queryKey: ["builderProfile"] });
    },
    onError: (error) => {
      log("❌ Session initialization failed", error instanceof Error ? error.message : String(error));
      console.error("Full Error:", error);
    },
  });
};
