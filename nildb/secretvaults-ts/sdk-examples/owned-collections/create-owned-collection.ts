import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { initSecretVaultBuilderClient } from '../client-helpers.js';
import { contactBookSchema } from '../schema-examples.js';

async function createOwnedCollection() {
  try {
    const builder = await initSecretVaultBuilderClient();
    const newCollectionId = randomUUID();

    const newOwnedCollection = await builder.createCollection({
      _id: newCollectionId,
      type: 'owned',
      name: 'Owned Contact Book 1',
      schema: contactBookSchema,
    });

    return { _id: newCollectionId, nodes: newOwnedCollection };
  } catch (error) {
    console.error('Error creating owned collection:', error);
    throw error;
  }
}

createOwnedCollection()
  .then((result) => {
    console.log(
      'Successfully created owned collection across nodes',
      JSON.stringify(result, null, 2)
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create owned collection:', JSON.stringify(error));
    process.exit(1);
  });
