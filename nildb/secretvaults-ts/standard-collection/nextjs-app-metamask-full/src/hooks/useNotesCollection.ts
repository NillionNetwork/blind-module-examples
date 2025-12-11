import type { CreateCollectionRequest } from "@nillion/secretvaults";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";
import { useProfile } from "./useProfile";
import { useNillion } from "./useNillion";

// Schema for notes collection with encrypted content field
// - title: plaintext (can be searched/filtered)
// - content: encrypted with %share (secret shared across nodes)
// Note: Schema uses "%share", client sends "%allot" which SDK transforms
const NOTES_COLLECTION_SCHEMA: Omit<CreateCollectionRequest, "_id"> = {
  type: "standard",
  name: "encrypted-notes",
  schema: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "array",
    uniqueItems: true,
    items: {
      type: "object",
      properties: {
        _id: { type: "string", format: "uuid" },
        walletAddress: { type: "string" },           // Plaintext - for filtering
        title: { type: "string" },                   // Plaintext - for display
        content: {                                   // ENCRYPTED - secret shared
          type: "object",
          properties: { "%share": { type: "string" } },
          required: ["%share"],
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
      required: ["_id", "walletAddress", "title", "content", "createdAt", "updatedAt"],
    },
  },
};

const NOTES_COLLECTION_ID_KEY = "notes_collection_id";

/**
 * Hook to get or create the notes collection ID.
 * Auto-creates the collection if it doesn't exist.
 * Uses localStorage to persist the collection ID per wallet.
 */
export function useNotesCollection() {
  const clientResult = useNillionClient();
  const { state } = useNillion();
  const { isRegistered } = useProfile();
  const walletAddress = state.wallets.metaMaskAddress;
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["notesCollection", walletAddress],
    queryFn: async () => {
      console.log("[useNotesCollection] Starting...", { clientResult: !!clientResult, walletAddress, isRegistered });

      if (!clientResult) {
        throw new Error("Nillion client not available");
      }
      const { nillionClient, nildbTokens } = clientResult;

      if (!walletAddress) {
        throw new Error("Wallet address is required");
      }
      if (!isRegistered) {
        throw new Error("Builder profile not registered");
      }

      // Check localStorage for existing collection ID for this wallet
      const storageKey = `${NOTES_COLLECTION_ID_KEY}_${walletAddress.toLowerCase()}`;
      const storedId = localStorage.getItem(storageKey);
      console.log("[useNotesCollection] Stored ID:", storedId);

      if (storedId) {
        // Verify collection still exists
        try {
          console.log("[useNotesCollection] Verifying existing collection...");
          await nillionClient.readCollection(storedId, {
            auth: { invocations: nildbTokens },
          });
          console.log("[useNotesCollection] Collection verified:", storedId);
          return storedId;
        } catch (err) {
          // Collection doesn't exist anymore, create a new one
          console.log("[useNotesCollection] Collection not found, will create new one:", err);
          localStorage.removeItem(storageKey);
        }
      }

      // Create new collection with notes schema
      console.log("[useNotesCollection] Creating new collection...");
      const collectionId = crypto.randomUUID();
      const result = await nillionClient.createCollection(
        {
          _id: collectionId,
          ...NOTES_COLLECTION_SCHEMA,
        },
        { auth: { invocations: nildbTokens } }
      );
      console.log("[useNotesCollection] Collection created:", collectionId, result);

      // Store in localStorage
      localStorage.setItem(storageKey, collectionId);

      // Invalidate profile to update collections list
      queryClient.invalidateQueries({ queryKey: ["builderProfile"] });

      return collectionId;
    },
    enabled: !!walletAddress && isRegistered && !!clientResult,
    staleTime: Infinity, // Collection ID doesn't change
    retry: 1,
  });
}
