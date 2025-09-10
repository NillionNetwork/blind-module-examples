import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { initSecretVaultBuilderClient } from '../client-helpers.js';
import {
  findContactByNameQuery,
  countAllContactsQuery,
  searchContactsByPartialNameQuery,
  getContactsAlphabeticallyQuery,
  getContactsWithoutSensitiveDataQuery,
  checkIfNameExistsQuery,
  findContactsWithNamePatternsQuery,
  getPaginatedContactsQuery,
  getRecentContactsQuery
} from '../query-examples.js';
import { contactBookSchema } from '../schema-examples.js';
import type {
  CreateQueryRequest,
  RunQueryRequest,
  RunQueryResultStatus,
} from '@nillion/secretvaults';

async function plaintextQueryExample() {
  try {
    const builderClient = await initSecretVaultBuilderClient();
    
    // Set to true if you want to clean up resources after the example
    const CLEANUP_AFTER_EXAMPLE = false;

    console.log('=== Plaintext Query Examples ===\n');
    console.log('📌 This example demonstrates querying on plaintext (unencrypted) fields in SecretVaults.');
    console.log('   We show various query operations using the name field as an example.\n');

    // Step 1: Create a collection for our queries
    console.log('Step 1: Creating a collection...');
    const collectionId = randomUUID();
    await builderClient.createCollection({
      _id: collectionId,
      type: 'standard',
      name: 'Plaintext Query Demo',
      schema: contactBookSchema,
    });
    console.log(`✅ Collection created: ${collectionId}`);

    // Step 2: Add sample data
    console.log('\nStep 2: Adding sample data...');
    console.log('📝 Creating contacts with:');
    console.log('   - name: plaintext field');
    console.log('   - phone_number: encrypted field');
    console.log('   - country_code: encrypted field\n');

    const contacts = [
      { name: 'Alice Johnson', phone: '555-0001', country: 1 },
      { name: 'Bob Smith', phone: '555-0002', country: 1 },
      { name: 'Charlie Anderson', phone: '555-0003', country: 44 },
      { name: 'Diana Prince', phone: '555-0004', country: 44 },
      { name: 'Eve Anderson', phone: '555-0005', country: 55 },
      { name: 'Frank Johnson', phone: '555-0006', country: 1 },
    ];

    const contactData = contacts.map((contact) => ({
      _id: randomUUID(),
      name: contact.name, // Plaintext - can be searched
      phone_number: {
        '%allot': contact.phone, // Encrypted - cannot be searched
      },
      country_code: {
        '%allot': contact.country, // Encrypted - cannot be searched
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
    console.log('\nStep 3: Creating queries that operate on plaintext fields...');
    const queries = [
      { query: findContactByNameQuery, id: randomUUID(), key: 'findByName' },
      { query: countAllContactsQuery, id: randomUUID(), key: 'countAll' },
      { query: searchContactsByPartialNameQuery, id: randomUUID(), key: 'searchPartial' },
      { query: getContactsAlphabeticallyQuery, id: randomUUID(), key: 'alphabetical' },
      { query: getContactsWithoutSensitiveDataQuery, id: randomUUID(), key: 'withoutSensitive' },
      { query: checkIfNameExistsQuery, id: randomUUID(), key: 'checkExists' },
      { query: findContactsWithNamePatternsQuery, id: randomUUID(), key: 'namePatterns' },
      { query: getPaginatedContactsQuery, id: randomUUID(), key: 'paginated' },
      { query: getRecentContactsQuery, id: randomUUID(), key: 'recent' },
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
    console.log('\nStep 4: Running queries on plaintext fields...');
    
    // Helper function to run a query and wait for results
    async function runQueryAndWaitForResults(queryId: string, variables: any = {}) {
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
    
    // Demo 1: Exact name match
    console.log(`\n🔍 Demo 1: Exact Name Match (plaintext field)`);
    const exactMatch = await runQueryAndWaitForResults(queryIds.findByName, { name: 'Alice Johnson' });
    console.log('Found:', JSON.stringify(exactMatch, null, 2));
    
    // Demo 2: Partial name search
    console.log(`\n🔎 Demo 2: Partial Name Search (plaintext field)`);
    const partialMatch = await runQueryAndWaitForResults(queryIds.searchPartial, { searchTerm: 'John' });
    console.log(`Found ${partialMatch.length} contacts with "John" in their name:`, 
      JSON.stringify(partialMatch, null, 2));
    
    // Demo 3: Count all contacts
    console.log(`\n📈 Demo 3: Count All Contacts`);
    const countResult = await runQueryAndWaitForResults(queryIds.countAll);
    console.log('Total contacts:', countResult[0]?.total_contacts || 0);
    
    // Demo 4: Check if name exists
    console.log(`\n❓ Demo 4: Check Name Existence (plaintext field)`);
    const existsResult = await runQueryAndWaitForResults(queryIds.checkExists, { nameToCheck: 'Bob Smith' });
    console.log('Bob Smith exists:', existsResult.length > 0 ? 'Yes' : 'No');
    
    const notExistsResult = await runQueryAndWaitForResults(queryIds.checkExists, { nameToCheck: 'John Doe' });
    console.log('John Doe exists:', notExistsResult.length > 0 ? 'Yes' : 'No');
    
    // Demo 5: Alphabetical sorting
    console.log(`\n🔤 Demo 5: Alphabetical Sorting (plaintext field)`);
    const alphabeticalResult = await runQueryAndWaitForResults(queryIds.alphabetical, { limit: 3 });
    console.log('First 3 contacts alphabetically:', JSON.stringify(alphabeticalResult, null, 2));
    
    // Demo 6: Complex name patterns
    console.log(`\n🎯 Demo 6: Complex Name Patterns (plaintext field)`);
    const patternResult = await runQueryAndWaitForResults(queryIds.namePatterns, { 
      firstNamePattern: '^[A-Z]',  // Starts with capital letter
      lastNamePattern: 'son$'       // Ends with "son"
    });
    console.log('Names ending with "son":', JSON.stringify(patternResult, null, 2));
    
    // Demo 7: Pagination
    console.log(`\n📄 Demo 7: Pagination (using plaintext fields for ordering)`);
    const page1 = await runQueryAndWaitForResults(queryIds.paginated, { page: 0, pageSize: 2 });
    console.log('Page 1 (first 2):', JSON.stringify(page1, null, 2));
    
    // Demo 8: Projection without encrypted fields
    console.log(`\n🔒 Demo 8: Projection of Plaintext Fields Only`);
    const withoutSensitive = await runQueryAndWaitForResults(queryIds.withoutSensitive);
    console.log('Contacts without encrypted data (first 2):', JSON.stringify(withoutSensitive.slice(0, 2), null, 2));
    console.log('Note: Only _id and name are returned (both plaintext)');
    
    // Summary
    console.log('\n📊 Summary of Demonstrated Query Capabilities:');
    console.log('✅ Search/filter on plaintext fields');
    console.log('✅ Use regex patterns for flexible text matching');
    console.log('✅ Sort and paginate results');
    console.log('✅ Count documents and check existence');
    console.log('✅ Project specific fields in results');
    console.log('\nThis example focused on plaintext field queries using the name field.');

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
      console.log('  Set CLEANUP_AFTER_EXAMPLE = true to delete these resources');
    }

    console.log('\n=== Plaintext Query Examples Completed Successfully! ===');
    
  } catch (error) {
    console.error('Error in plaintext query example:', error);
    throw error;
  }
}

plaintextQueryExample()
  .then(() => {
    console.log('\nAll operations completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to complete example:', JSON.stringify(error));
    process.exit(1);
  });