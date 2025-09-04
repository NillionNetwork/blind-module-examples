import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { initSecretVaultBuilderClient } from './helpers.js';

async function createStandardRecord(collectionId: string) {
  try {
    const builder = await initSecretVaultBuilderClient();

    // Tip: use https://collection-explorer.nillion.com/collections/<collection-id> to view the collection and schema
    // the collection page shows an "Example Record Payload" button that will show you the data structure for a record in the collection
    const recordData = [
      {
        _id: randomUUID(),
        'first name': 'Steph',
        'phone number': {
          '%allot': '555-555-5555', // field marked with %allot will be encrypted
        },
      },
    ];

    const newStandardRecord = await builder.createStandardData({
      body: {
        collection: collectionId,
        data: recordData,
      },
    });

    return newStandardRecord;
  } catch (error) {
    console.error('Error creating standard record:', error);
    throw error;
  }
}

const collectionId = process.env.NILLION_COLLECTION_ID;

if (!collectionId) {
  console.error('Missing required environment variable: NILLION_COLLECTION_ID');
  process.exit(1);
}

createStandardRecord(collectionId)
  .then((result) => {
    console.log(
      'Successfully created standard record across nodes',
      JSON.stringify(result, null, 2)
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create standard record:', JSON.stringify(error));
    process.exit(1);
  });
