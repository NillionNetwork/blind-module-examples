import { VmClientBuilder, createSignerFromKey } from '@nillion/client-vms';
import {
  networkConfig,
  NILLION_USER_KEY_SEED,
  NILLION_NILCHAIN_PRIVATE_KEY,
} from './nillionNetworkConfig.js';
import { tecdsaKeyName } from './nillionSignatureConstants.js';

// Replace this with the store ID of your permissioned private key
const storeId = 'eab372e8-b384-4517-a07f-78ce96cb8c7e';

export async function retrievePrivateKey(storeId) {
  console.log('Retrieving private key for store ID:', storeId);
  // Create signer - this is the nilchain account that pays for nillion operations
  const signer = await createSignerFromKey(NILLION_NILCHAIN_PRIVATE_KEY);

  // Initialize Nillion client
  const clientBuilder = new VmClientBuilder();
  clientBuilder
    .seed(NILLION_USER_KEY_SEED)
    .bootnodeUrl(networkConfig.NILLION_GRPC_ENDPOINT)
    .chainUrl(networkConfig.NILLION_NILCHAIN_JSON_RPC)
    .signer(signer);

  const client = await clientBuilder.build();

  // Retrieve private key from Nillion
  const retrieved = await client.retrieveValues().id(storeId).build().invoke();

  const privateKey = Buffer.from(retrieved[tecdsaKeyName].value).toString(
    'hex'
  );

  console.log('Retrieved private key:', privateKey);
  return privateKey;
}

retrievePrivateKey(storeId);
