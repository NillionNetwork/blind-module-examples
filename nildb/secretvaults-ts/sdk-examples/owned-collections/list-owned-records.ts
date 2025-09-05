import 'dotenv/config';
import { initSecretVaultUserClient } from '../client-helpers.js';

async function listOwnedRecords() {
  try {
    const userClient = await initSecretVaultUserClient();

    // List all data references owned by the user
    const referencesResponse = await userClient.listDataReferences();

    if (!referencesResponse.data || referencesResponse.data.length === 0) {
      return {
        owner: userClient.id,
        count: 0,
        records: [],
      };
    }

    // Format the response
    const records = referencesResponse.data.map((ref: any, index: number) => ({
      index: index + 1,
      collection: ref.collection,
      record: ref.document || ref.id, // API uses 'document' but we call it 'record'
      builderClient: ref.builderClient,
    }));

    return {
      owner: userClient.id,
      count: records.length,
      records: records,
    };
  } catch (error) {
    console.error('Error listing owned records:', error);
    throw error;
  }
}

listOwnedRecords()
  .then((result) => {
    console.log(
      'Owned records retrieved successfully',
      JSON.stringify(result, null, 2)
    );

    // Also print a simple summary
    if (result.records.length > 0) {
      console.log('\n📄 Summary:');
      result.records.forEach((rec) => {
        console.log(`${rec.index}. Collection: ${rec.collection}`);
        console.log(`   Record: ${rec.record}`);
        console.log(`   Builder: ${rec.builderClient}\n`);
      });
    } else {
      console.log('\nNo owned records found.');
    }

    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to list owned records:', JSON.stringify(error));
    process.exit(1);
  });
