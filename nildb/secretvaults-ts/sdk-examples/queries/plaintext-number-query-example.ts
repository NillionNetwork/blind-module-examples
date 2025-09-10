import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { initSecretVaultBuilderClient } from '../client-helpers.js';
import {
  findContactsByExactAgeQuery,
  findContactsByAgeRangeQuery,
  findContactsOlderThanQuery,
  findContactsYoungerThanQuery,
  calculateAverageAgeQuery,
  groupContactsByAgeRangeQuery,
  findOldestAndYoungestQuery,
  getContactsByAgeWithPaginationQuery,
  calculateAgeStatisticsQuery,
} from '../query-examples-number.js';
import { contactBookSchema } from '../schema-examples.js';
import type {
  CreateQueryRequest,
  RunQueryRequest,
  RunQueryResultStatus,
} from '@nillion/secretvaults';

async function plaintextNumberQueryExample() {
  try {
    const builderClient = await initSecretVaultBuilderClient();

    // Set to true if you want to clean up resources after the example
    const CLEANUP_AFTER_EXAMPLE = false;

    console.log('=== Plaintext Number Query Examples (Age) ===\n');
    console.log(
      '📌 This example demonstrates querying on plaintext number fields in SecretVaults.'
    );
    console.log(
      '   We show various query operations using the age field as an example.\n'
    );

    // Step 1: Create a collection for our queries
    console.log('Step 1: Creating a collection...');
    const collectionId = randomUUID();
    await builderClient.createCollection({
      _id: collectionId,
      type: 'standard',
      name: 'Number Query Demo',
      schema: contactBookSchema,
    });
    console.log(`✅ Collection created: ${collectionId}`);

    // Step 2: Add sample data with various ages
    console.log('\nStep 2: Adding sample data...');
    console.log('📝 Creating contacts with:');
    console.log('   - name: plaintext field');
    console.log('   - age: plaintext number field');
    console.log('   - phone_number: encrypted field');
    console.log('   - country_code: encrypted field\n');

    const contacts = [
      { name: 'Alice Johnson', age: 25, phone: '555-0101', country: 1 },
      { name: 'Bob Smith', age: 30, phone: '555-0102', country: 1 },
      { name: 'Charlie Brown', age: 25, phone: '555-0103', country: 44 },
      { name: 'Diana Prince', age: 42, phone: '555-0104', country: 44 },
      { name: 'Edward Norton', age: 55, phone: '555-0105', country: 55 },
      { name: 'Fiona Apple', age: 19, phone: '555-0106', country: 1 },
      { name: 'George Michael', age: 67, phone: '555-0107', country: 1 },
      { name: 'Hannah Montana', age: 16, phone: '555-0108', country: 1 },
      { name: 'Ian McKellen', age: 85, phone: '555-0109', country: 44 },
      { name: 'Julia Roberts', age: 35, phone: '555-0110', country: 1 },
    ];

    const contactData = contacts.map((contact) => ({
      _id: randomUUID(),
      name: contact.name,
      age: contact.age, // Plaintext number - can be queried
      phone_number: {
        '%allot': contact.phone, // Encrypted - cannot be queried
      },
      country_code: {
        '%allot': contact.country, // Encrypted - cannot be queried
      },
    }));

    await builderClient.createStandardData({
      body: {
        collection: collectionId,
        data: contactData,
      },
    });
    console.log(`✅ Created ${contacts.length} contacts`);

    // Step 3: Create all queries
    console.log('\nStep 3: Creating queries that operate on number fields...');
    const queries = [
      { query: findContactsByExactAgeQuery, id: randomUUID(), key: 'exactAge' },
      { query: findContactsByAgeRangeQuery, id: randomUUID(), key: 'ageRange' },
      { query: findContactsOlderThanQuery, id: randomUUID(), key: 'olderThan' },
      {
        query: findContactsYoungerThanQuery,
        id: randomUUID(),
        key: 'youngerThan',
      },
      { query: calculateAverageAgeQuery, id: randomUUID(), key: 'avgAge' },
      {
        query: groupContactsByAgeRangeQuery,
        id: randomUUID(),
        key: 'ageGroups',
      },
      {
        query: findOldestAndYoungestQuery,
        id: randomUUID(),
        key: 'oldestYoungest',
      },
      {
        query: getContactsByAgeWithPaginationQuery,
        id: randomUUID(),
        key: 'agePagination',
      },
      { query: calculateAgeStatisticsQuery, id: randomUUID(), key: 'ageStats' },
    ];

    const queryIds: Record<string, string> = {};

    for (const { query, id, key } of queries) {
      queryIds[key] = id;

      const queryRequest: CreateQueryRequest = {
        ...query,
        _id: id,
        collection: collectionId,
      };

      await builderClient.createQuery(queryRequest);
      console.log(`✅ Created query: ${query.name}`);
    }

    // Step 4: Run queries
    console.log('\nStep 4: Running queries on number fields...');

    // Helper function to run a query and wait for results
    async function runQueryAndWaitForResults(
      queryId: string,
      variables: any = {}
    ) {
      const runRequest: RunQueryRequest = {
        _id: queryId,
        variables,
      };

      const runResponse = await builderClient.runQuery(runRequest);
      const runIds: Record<string, string> = {};
      Object.entries(runResponse).forEach(([nodeId, response]) => {
        if (response?.data) {
          runIds[nodeId] = response.data;
        }
      });

      // Poll for results
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const resultsResponse = await builderClient.readQueryRunResults(runIds);
        let allCompleted = true;
        let results: any = null;

        for (const [nodeId, response] of Object.entries(resultsResponse)) {
          if (response?.data) {
            const status: RunQueryResultStatus = response.data.status;

            if (status === 'complete') {
              if (response.data.result) {
                results = response.data.result;
              }
            } else if (status === 'error') {
              console.error(`Error on node ${nodeId}:`, response.data.errors);
              throw new Error('Query execution failed');
            } else {
              allCompleted = false;
            }
          }
        }

        if (allCompleted) {
          return results;
        }
        attempts++;
      }

      throw new Error('Query execution timed out');
    }

    // Demo 1: Find by exact age
    console.log(`\n🔍 Demo 1: Find Contacts by Exact Age`);
    const exactAgeResult = await runQueryAndWaitForResults(queryIds.exactAge, {
      age: 25,
    });
    console.log('Contacts aged 25:', JSON.stringify(exactAgeResult, null, 2));

    // Demo 2: Find by age range
    console.log(`\n📊 Demo 2: Find Contacts by Age Range`);
    const ageRangeResult = await runQueryAndWaitForResults(queryIds.ageRange, {
      minAge: 20,
      maxAge: 30,
    });
    console.log(
      'Contacts aged 20-30:',
      JSON.stringify(ageRangeResult, null, 2)
    );

    // Demo 3: Find older than
    console.log(`\n⬆️  Demo 3: Find Contacts Older Than`);
    const olderThanResult = await runQueryAndWaitForResults(
      queryIds.olderThan,
      {
        minAge: 50,
      }
    );
    console.log(
      'Contacts older than 50:',
      JSON.stringify(olderThanResult, null, 2)
    );

    // Demo 4: Find younger than
    console.log(`\n⬇️  Demo 4: Find Contacts Younger Than`);
    const youngerThanResult = await runQueryAndWaitForResults(
      queryIds.youngerThan,
      {
        maxAge: 20,
      }
    );
    console.log(
      'Contacts younger than 20:',
      JSON.stringify(youngerThanResult, null, 2)
    );

    // Demo 5: Calculate average age
    console.log(`\n🧮 Demo 5: Calculate Average Age`);
    const avgAgeResult = await runQueryAndWaitForResults(queryIds.avgAge);
    console.log(
      'Average age statistics:',
      JSON.stringify(avgAgeResult, null, 2)
    );

    // Demo 6: Group by age ranges
    console.log(`\n📈 Demo 6: Group Contacts by Age Ranges`);
    const ageGroupsResult = await runQueryAndWaitForResults(queryIds.ageGroups);
    console.log('Age groups:', JSON.stringify(ageGroupsResult, null, 2));

    // Demo 7: Find oldest and youngest
    console.log(`\n🎯 Demo 7: Find Oldest and Youngest`);
    const oldestYoungestResult = await runQueryAndWaitForResults(
      queryIds.oldestYoungest
    );
    console.log(
      'Oldest and youngest ages:',
      JSON.stringify(oldestYoungestResult, null, 2)
    );

    // Demo 8: Pagination with age sorting
    console.log(`\n📄 Demo 8: Pagination with Age Sorting`);
    const page1 = await runQueryAndWaitForResults(queryIds.agePagination, {
      page: 0,
      pageSize: 3,
      sortOrder: 1, // Ascending
    });
    console.log('Page 1 (ascending by age):', JSON.stringify(page1, null, 2));

    const page2 = await runQueryAndWaitForResults(queryIds.agePagination, {
      page: 0,
      pageSize: 3,
      sortOrder: -1, // Descending
    });
    console.log('Page 1 (descending by age):', JSON.stringify(page2, null, 2));

    // Demo 9: Comprehensive age statistics
    console.log(`\n📊 Demo 9: Comprehensive Age Statistics`);
    const ageStatsResult = await runQueryAndWaitForResults(queryIds.ageStats);
    console.log('Age statistics:', JSON.stringify(ageStatsResult, null, 2));

    // Summary
    console.log('\n📊 Summary of Number Field Query Capabilities:');
    console.log('✅ Exact number matching');
    console.log('✅ Range queries (gt, gte, lt, lte)');
    console.log('✅ Aggregations (avg, min, max, sum)');
    console.log('✅ Statistical calculations (standard deviation)');
    console.log('✅ Bucketing/grouping by ranges');
    console.log('✅ Sorting and pagination by numeric values');
    console.log(
      '\nThis example focused on number field queries using the age field.'
    );

    // Optional cleanup steps
    if (CLEANUP_AFTER_EXAMPLE) {
      console.log('\n=== Cleanup Steps ===');

      // Delete all queries
      console.log('\nDeleting queries...');
      for (const [key, queryId] of Object.entries(queryIds)) {
        await builderClient.deleteQuery(queryId);
      }
      console.log('✅ All queries deleted');

      // Delete the collection
      console.log('\nDeleting collection...');
      await builderClient.deleteCollection(collectionId);
      console.log('✅ Collection deleted');
    } else {
      console.log('\n📌 Cleanup skipped. Resources retained:');
      console.log(`  - Collection ID: ${collectionId}`);
      console.log('  - Query IDs:', queryIds);
      console.log(
        '  Set CLEANUP_AFTER_EXAMPLE = true to delete these resources'
      );
    }

    console.log('\n=== Number Query Examples Completed Successfully! ===');
  } catch (error) {
    console.error('Error in number query example:', error);
    throw error;
  }
}

plaintextNumberQueryExample()
  .then(() => {
    console.log('\nAll operations completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to complete example:', JSON.stringify(error));
    process.exit(1);
  });
