import {
  VmClientBuilder,
  createSignerFromKey,
  ValuesPermissionsBuilder,
} from '@nillion/client-vms';
import { NadaValue } from '@nillion/client-wasm';
import { generatePrivateKey } from './helpers.js';
import {
  networkConfig,
  NILLION_USER_KEY_SEED,
  NILLION_NILCHAIN_PRIVATE_KEY,
} from './nillionNetworkConfig.js';
import { tecdsaKeyName, tecdsaProgramId } from './nillionSignatureConstants.js';

const { privateKey: privateKeyToStore } = generatePrivateKey();

/**
 * Store private key in Nillion
 * @param {string} privateKey - Optional private key to store. If not provided, a new one will be generated.
 * @returns {Promise<string>} Store ID of the stored private key
 */
export async function storePrivateKeyInNillion(privateKey = null) {
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

  // Generate private key if not provided
  if (!privateKey) {
    const keys = generatePrivateKey();
    privateKey = keys.privateKey;
  } else {
    if (typeof privateKey === 'string') {
      privateKey = Buffer.from(privateKey, 'hex');
    }
  }

  // Give the current user (client.id) permission to sign with the private key
  // via the tecdsa program
  const permissions = ValuesPermissionsBuilder.defaultOwner(client.id)
    .grantCompute(client.id, tecdsaProgramId)
    .build();

  // Store the permissioned private key data value in Nillion
  console.log('Storing private key');
  const storeId = await client
    .storeValues()
    .ttl(1)
    .value(tecdsaKeyName, NadaValue.new_ecdsa_private_key(privateKey))
    .permissions(permissions)
    .build()
    .invoke();

  console.log('Stored permissioned private key in Nillion. Store ID:', storeId);

  return storeId;
}

storePrivateKeyInNillion(privateKeyToStore);
