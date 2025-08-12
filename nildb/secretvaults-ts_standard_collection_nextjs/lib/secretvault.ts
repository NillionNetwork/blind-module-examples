import { Keypair } from '@nillion/nuc';
import { SecretVaultBuilderClient } from '@nillion/secretvaults';
import { config, validateConfig } from './config';

let cachedClient: SecretVaultBuilderClient | null = null;

export async function getSecretVaultClient(): Promise<SecretVaultBuilderClient> {
  if (cachedClient) {
    return cachedClient;
  }

  validateConfig();

  const builderKeypair = Keypair.from(config.NILLION_API_KEY);

  const builder = await SecretVaultBuilderClient.from({
    keypair: builderKeypair,
    urls: {
      chain: config.NILCHAIN_URL,
      auth: config.NILAUTH_URL,
      dbs: config.NILDB_NODES,
    },
    blindfold: {
      operation: 'store',
    },
  });

  await builder.refreshRootToken();
  cachedClient = builder;
  
  return builder;
}