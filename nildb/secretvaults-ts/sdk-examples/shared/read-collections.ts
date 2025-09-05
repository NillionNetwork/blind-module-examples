import 'dotenv/config';
import { initSecretVaultBuilderClient } from '../client-helpers.js';

async function readCollections() {
  try {
    const builderClient = await initSecretVaultBuilderClient();
    const collections = await builderClient.readCollections();
    return collections;
  } catch (error) {
    console.error('Error reading collections:', JSON.stringify(error));
    throw error;
  }
}

readCollections()
  .then((result) => {
    console.log(
      'Successfully read all collections',
      JSON.stringify(result, null, 2)
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to read collections:', JSON.stringify(error));
    process.exit(1);
  });
