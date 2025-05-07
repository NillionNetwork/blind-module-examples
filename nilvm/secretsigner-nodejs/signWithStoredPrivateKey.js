import { VmClientBuilder, createSignerFromKey } from "@nillion/client-vms";
import { NadaValue } from "@nillion/client-wasm";
import { sha256 } from "@noble/hashes/sha2";
import { secp256k1 } from "@noble/curves/secp256k1";
import {
  networkConfig,
  NILLION_USER_KEY_SEED,
  NILLION_NILCHAIN_PRIVATE_KEY,
} from "./nillionNetworkConfig.js";
import {
  tecdsaProgramId,
  tecdsaKeyParty,
  tecdsaOutputParty,
  tecdsaDigestParty,
  tecdsaDigestName,
  tecdsaSignatureName,
} from "./nillionSignatureConstants.js";
import { toBigInt } from "./helpers.js";

// Replace this with the store ID of your permissioned private key

const storeId = "4cde3146-8240-452a-8610-c0a3c8bef6c2";
const messageToSign = "A super secret message!";
const publicKey =
  "031e89423e8853c8874dba1de8593e171947d76716ddc34f788341ca55bfc46612";

export async function signWithStoredPrivateKey(
  storeId,
  messageToSign,
  publicKey = null
) {
  console.log("Signing with stored private key from store ID:", storeId);
  console.log("Message to sign:", messageToSign);
  // Create signer - this is the nilchain account that pays for nillion operations
  const signer = await createSignerFromKey(NILLION_NILCHAIN_PRIVATE_KEY);

  // Initialize Nillion client
  const clientBuilder = new VmClientBuilder();
  clientBuilder
    .seed(NILLION_USER_KEY_SEED)
    .bootnodeUrl(networkConfig.NILLION_NILVM_GRPC_ENDPOINT)
    .chainUrl(networkConfig.NILLION_NILCHAIN_JSON_RPC)
    .signer(signer);

  const client = await clientBuilder.build();

  const messageHash = sha256(messageToSign);

  const computeResultId = await client
    .invokeCompute()
    .program(tecdsaProgramId)
    .inputParty(tecdsaKeyParty, client.id)
    .inputParty(tecdsaDigestParty, client.id)
    .outputParty(tecdsaOutputParty, [client.id])
    .valueIds(storeId)
    .computeTimeValues(
      tecdsaDigestName,
      NadaValue.new_ecdsa_digest_message(messageHash)
    )
    .build()
    .invoke();

  console.log("Compute ResultID:", computeResultId);

  const computeResult = await client
    .retrieveComputeResult()
    .id(computeResultId)
    .build()
    .invoke();

  const signature = computeResult[tecdsaSignatureName]?.value;

  const r = toBigInt(signature.r());
  const s = toBigInt(signature.s());

  const sig = new secp256k1.Signature(r, s);
  console.log("Signature:", sig.toCompactHex());

  if (publicKey) {
    const verifiedSignature = secp256k1.verify(
      { r: r, s: s },
      messageHash,
      publicKey
    );
    console.log("Verified signature:", verifiedSignature);
    if (!verifiedSignature) {
      throw new Error(
        "Signature verification failed - double check that the public key of the signer corresponds to the private key stored in Nillion"
      );
    }
  } else {
    console.log(
      "Cannot verify signature because the public key was not provided"
    );
  }
}

signWithStoredPrivateKey(storeId, messageToSign, publicKey);
