import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { initSecretVaultBuilderClient } from '../client-helpers.js';
import { contactBookSchema } from '../schema-examples.js';

async function createStandardCollection() {
  try {
    const builderClient = await initSecretVaultBuilderClient();
    const newCollectionId = randomUUID();

    const newStandardCollection = await builderClient.createCollection({
      _id: newCollectionId,
      type: 'standard',
      name: 'Contact Book',
      schema: contactBookSchema,
    });

    return { _id: newCollectionId, nodes: newStandardCollection };
  } catch (error) {
    console.error('Error creating standard collection:', error);
    throw error;
  }
}

createStandardCollection()
  .then((result) => {
    console.log(
      'Successfully created standard collection across nodes',
      JSON.stringify(result, null, 2)
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error(
      'Failed to create standard collection:',
      JSON.stringify(error)
    );
    process.exit(1);
  });
