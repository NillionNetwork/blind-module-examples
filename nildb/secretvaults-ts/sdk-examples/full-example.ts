import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { initSecretVaultBuilderClient } from './helpers.js';
import { contactBookSchema } from './schema-examples.js';

async function runStandardCollectionExample() {
  try {
    const builder = await initSecretVaultBuilderClient();

    // 1. Create a new standard collection
    console.log('\n1. Creating standard collection...');
    const collectionId = randomUUID();
    const newCollection = await builder.createCollection({
      _id: collectionId,
      type: 'standard',
      name: 'Contact Book Example',
      schema: contactBookSchema,
    });
    console.log('✅ Collection created:', {
      _id: collectionId,
      nodes: newCollection,
    });

    // 2. Add 3 records to the collection in a single call
    console.log('\n2. Adding 3 records to the collection...');
    const record1Id = randomUUID();
    const record2Id = randomUUID();
    const record3Id = randomUUID();

    const createRecordsResult = await builder.createStandardData({
      body: {
        collection: collectionId,
        data: [
          {
            _id: record1Id,
            'first name': 'Alice',
            'phone number': {
              '%allot': '555-0001', // encrypted field
            },
          },
          {
            _id: record2Id,
            'first name': 'Bob',
            'phone number': {
              '%allot': '555-0002', // encrypted field
            },
          },
          {
            _id: record3Id,
            'first name': 'Charlie',
            'phone number': {
              '%allot': '555-0003', // encrypted field
            },
          },
        ],
      },
    });
    console.log(
      '✅ All 3 records created:',
      JSON.stringify(createRecordsResult, null, 2)
    );

    // 3. Update record 2
    console.log('\n3. Updating record 2...');
    const updateResult = await builder.updateData({
      collection: collectionId,
      filter: {
        _id: record2Id,
      },
      update: {
        $set: {
          'first name': 'Robert',
          'phone number': {
            '%allot': '555-9999', // updated encrypted field
          },
        },
      },
    });
    console.log('✅ Record updated:', JSON.stringify(updateResult, null, 2));

    // 4. Delete record 1
    console.log('\n4. Deleting record 1...');
    const deleteResult = await builder.deleteData({
      collection: collectionId,
      filter: {
        _id: record1Id,
      },
    });
    console.log('✅ Record deleted:', JSON.stringify(deleteResult, null, 2));

    // Final state: Show remaining records
    console.log('\n5. Final state - remaining records:');
    const remainingRecords = await builder.findData({
      collection: collectionId,
      filter: {}, // Empty filter returns all records
    });
    console.log(
      '📋 Remaining records:',
      JSON.stringify(remainingRecords.data, null, 2)
    );

    // Summary
    console.log('\n✅ Example completed successfully!');
    console.log(`Collection ID: ${collectionId}`);
    console.log(`Remaining records: ${remainingRecords.data.length}`);
    console.log(
      `You can view the collection at: https://collection-explorer.nillion.com/collections/${collectionId}`
    );

    return {
      collectionId,
      recordIds: [record1Id, record2Id, record3Id],
      remainingRecords: remainingRecords.data,
    };
  } catch (error) {
    console.error('Error in standard collection example:', error);
    throw error;
  }
}

runStandardCollectionExample()
  .then(() => {
    console.log('\n🎉 Standard collection example finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(
      'Failed to run standard collection example:',
      JSON.stringify(error)
    );
    process.exit(1);
  });
