import { VmClientBuilder, createSignerFromKey } from '@nillion/client-vms';
import { NadaValue } from '@nillion/client-wasm';
import { sha256 } from '@noble/hashes/sha2';
import { secp256k1 } from '@noble/curves/secp256k1';
import {
  networkConfig,
  NILLION_USER_KEY_SEED,
  NILLION_NILCHAIN_PRIVATE_KEY,
} from './nillionNetworkConfig.js';
import {
  tecdsaProgramId,
  tecdsaKeyParty,
  tecdsaOutputParty,
  tecdsaDigestParty,
  tecdsaDigestName,
  tecdsaSignatureName,
} from './nillionSignatureConstants.js';
import { toBigInt } from './helpers.js';

// Replace this with the store ID of your permissioned private key
const storeId = 'ecad4cb7-c235-41f9-9fbc-1c7e72a17a51';
const messageToSign = 'A super secret message!';
const publicKey =
  '02581e4efbd50327c14efca1832148a3247944b271a3519061a94f3b561322b96a';

export async function signWithStoredPrivateKey(
  storeId,
  messageToSign,
  publicKey = null
) {
  console.log('Signing with stored private key from store ID:', storeId);
  console.log('Message to sign:', messageToSign);
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

  console.log(computeResultId);

  const computeResult = await client
    .retrieveComputeResult()
    .id(computeResultId)
    .build()
    .invoke();

  const signature = computeResult[tecdsaSignatureName]?.value;
  console.log('Signature:', signature);

  const r = toBigInt(signature.r());
  const s = toBigInt(signature.s());

  if (publicKey) {
    const verifiedSignature = secp256k1.verify(
      { r: r, s: s },
      messageHash,
      publicKey
    );
    console.log('Verified signature:', verifiedSignature);
    if (!verifiedSignature) {
      throw new Error(
        'Signature verification failed - double check that the public key of the signer corresponds to the private key stored in Nillion'
      );
    }
  } else {
    console.log(
      'Cannot verify signature because the public key was not provided'
    );
  }
}

signWithStoredPrivateKey(storeId, messageToSign, publicKey);
