import { Builder, type Command, Validator } from "@nillion/nuc";
import { NilauthClient } from "@nillion/nilauth-client";
import { NucCmd, SecretVaultBuilderClient } from "@nillion/secretvaults";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NETWORK_CONFIG } from "@/config";
import { useLogContext } from "@/context/LogContext";
import { useNillion } from "@/hooks/useNillion";
import { usePersistedConnection } from "@/hooks/usePersistedConnection";
import type { Session } from "./useSessionQuery";

async function login(
  signer: ReturnType<typeof useNillion>["state"]["signer"],
  log: ReturnType<typeof useLogContext>["log"],
  getStoredRootToken: () => string | null,
  getStoredNildbTokens: () => Record<string, string> | null,
): Promise<Session> {
  if (!signer) {
    throw new Error("Signer not available");
  }

  const storedRootToken = getStoredRootToken();
  const storedNildbTokens = getStoredNildbTokens();

  if (!storedRootToken) {
    throw new Error("No stored session found to login.");
  }

  log("📦 Found stored session, re-hydrating clients...");
  const nilauthClient = await NilauthClient.create({
    baseUrl: NETWORK_CONFIG.nilauth,
    chainId: NETWORK_CONFIG.nilauthChainId,
  });

  const nillionClient = await SecretVaultBuilderClient.from({
    signer,
    nilauthClient,
    dbs: NETWORK_CONFIG.nildb,
    blindfold: { operation: "store" },  // Enable encryption for %allot fields
    rootToken: storedRootToken,
  });

  log("✅ Clients re-hydrated.");

  log("🔑 Validating stored root token...");
  const rootToken = await Validator.parse(storedRootToken, {
    rootIssuers: [nilauthClient.nilauthDid.didString],
  });
  log("✅ Root token validated.");

  // Reuse stored nildb tokens if available, otherwise mint fresh ones
  let nildbTokens: Record<string, string>;
  if (storedNildbTokens && Object.keys(storedNildbTokens).length > 0) {
    log("✅ Using stored node tokens.");
    nildbTokens = storedNildbTokens;
  } else {
    log(`🔨 Minting fresh invocation tokens for ${nillionClient.nodes.length} NilDB nodes...`);
    nildbTokens = {};
    for (const node of nillionClient.nodes) {
      nildbTokens[node.id.didString] = await Builder.invocationFrom(rootToken)
        .audience(node.id)
        .command(NucCmd.nil.db.root as Command)
        .expiresIn(86400)
        .signAndSerialize(signer);
    }
    log("✅ All node tokens minted.");
  }

  log("🔍 Checking for existing builder profile...");
  let profileExists = false;
  try {
    await nillionClient.readProfile({ auth: { invocations: nildbTokens } });
    log("✅ Builder profile found.");
    profileExists = true;
  } catch (profileError) {
    log("ℹ️ No profile found, attempting to register builder...");
    try {
      const subscriberDid = await signer.getDid();
      await nillionClient.register({
        did: subscriberDid.didString,
        name: "Demo Builder",
      });
      log("✅ Builder registered successfully.");
      profileExists = true;
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
        profileExists = true;
      } else {
        throw registerError;
      }
    }
  }

  return { nillionClient, nilauthClient, rootToken, nildbTokens };
}

export const useLoginMutation = () => {
  const { log } = useLogContext();
  const { state } = useNillion();
  const { getStoredRootToken, getStoredNildbTokens, setStoredNildbTokens } = usePersistedConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => login(state.signer, log, getStoredRootToken, getStoredNildbTokens),
    onSuccess: async (data) => {
      log("✅ Session re-established.");
      queryClient.setQueryData(["session"], data);
      setStoredNildbTokens(data.nildbTokens);
      await queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
      await queryClient.invalidateQueries({ queryKey: ["builderProfile"] });
    },
    onError: (error) => {
      log("❌ Login failed.", error instanceof Error ? error.message : String(error));
    },
  });
};
