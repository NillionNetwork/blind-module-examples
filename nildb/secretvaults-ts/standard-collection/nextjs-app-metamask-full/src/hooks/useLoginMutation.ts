import { Builder, type Command, NilauthClient, Validator } from "@nillion/nuc";
import { NucCmd, SecretVaultBuilderClient } from "@nillion/secretvaults";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NETWORK_CONFIG } from "@/config";
import { useNillion } from "@/hooks/useNillion";
import { usePersistedConnection } from "@/hooks/usePersistedConnection";
import type { Session } from "./useSessionQuery";

async function login(
  signer: ReturnType<typeof useNillion>["state"]["signer"],
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

  console.log("[Nillion] Found stored session, re-hydrating clients...");
  const nilauthClient = await NilauthClient.create({
    baseUrl: NETWORK_CONFIG.nilauth,
    payer: undefined
  });

  const nillionClient = await SecretVaultBuilderClient.from({
    signer,
    nilauthClient,
    dbs: NETWORK_CONFIG.nildb,
    blindfold: { operation: "store" },  // Enable encryption for %allot fields
    rootToken: storedRootToken,
  });

  console.log("[Nillion] Clients re-hydrated.");

  console.log("[Nillion] Validating stored root token...");
  const rootToken = await Validator.parse(storedRootToken, {
    rootIssuers: [nilauthClient.nilauthDid.didString],
  });
  console.log("[Nillion] Root token validated.");

  // Reuse stored nildb tokens if available, otherwise mint fresh ones
  let nildbTokens: Record<string, string>;
  if (storedNildbTokens && Object.keys(storedNildbTokens).length > 0) {
    console.log("[Nillion] Using stored node tokens.");
    nildbTokens = storedNildbTokens;
  } else {
    console.log(`[Nillion] Minting fresh invocation tokens for ${nillionClient.nodes.length} NilDB nodes...`);
    nildbTokens = {};
    for (const node of nillionClient.nodes) {
      nildbTokens[node.id.didString] = await Builder.invocationFrom(rootToken)
        .audience(node.id)
        .command(NucCmd.nil.db.root as Command)
        .expiresIn(86400)
        .signAndSerialize(signer);
    }
    console.log("[Nillion] All node tokens minted.");
  }

  console.log("[Nillion] Checking for existing builder profile...");
  let profileExists = false;
  try {
    await nillionClient.readProfile({ auth: { invocations: nildbTokens } });
    console.log("[Nillion] Builder profile found.");
    profileExists = true;
  } catch (profileError) {
    console.log("[Nillion] No profile found, attempting to register builder...");
    try {
      const subscriberDid = await signer.getDid();
      await nillionClient.register({
        did: subscriberDid.didString,
        name: "Demo Builder",
      });
      console.log("[Nillion] Builder registered successfully.");
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
        console.log("[Nillion] Builder already registered (duplicate entry) - continuing.");
        profileExists = true;
      } else {
        throw registerError;
      }
    }
  }

  return { nillionClient, nilauthClient, rootToken, nildbTokens };
}

export const useLoginMutation = () => {
  const { state } = useNillion();
  const { getStoredRootToken, getStoredNildbTokens, setStoredNildbTokens } = usePersistedConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => login(state.signer, getStoredRootToken, getStoredNildbTokens),
    onSuccess: async (data) => {
      console.log("[Nillion] Session re-established.");
      queryClient.setQueryData(["session"], data);
      setStoredNildbTokens(data.nildbTokens);
      await queryClient.invalidateQueries({ queryKey: ["builderProfile"] });
    },
    onError: (error) => {
      console.error("[Nillion] Login failed.", error instanceof Error ? error.message : String(error));
    },
  });
};
