import 'dotenv/config';
import { initSecretVaultBuilderClient } from '../client-helpers.js';
async function listQueries() {
    try {
        const builderClient = await initSecretVaultBuilderClient();
        const queries = await builderClient.getQueries();
        // Debug: log the response structure
        console.log('Response structure:', {
            hasData: !!queries,
            nodeCount: Object.keys(queries).length,
            firstNodeKeys: Object.values(queries)[0] ? Object.keys(Object.values(queries)[0]) : []
        });
        // Get data from the first node (should be same across all nodes)
        const firstNodeResponse = Object.values(queries)[0];
        if (!firstNodeResponse) {
            console.log('No response from nodes.');
            return [];
        }
        // The data might be in different places depending on API version
        const data = firstNodeResponse.data || firstNodeResponse;
        if (!Array.isArray(data) || data.length === 0) {
            console.log('No queries found.');
            return [];
        }
        return data;
    }
    catch (error) {
        console.error('Error listing queries:', error);
        console.error('Note: The getQueries API might have response format issues. Individual query operations (create, get by ID, run, delete) work correctly.');
        throw error;
    }
}
listQueries()
    .then((queries) => {
    console.log(`Found ${queries.length} query(ies):`);
    queries.forEach((query) => {
        console.log(`\nQuery: ${query.name}`);
        console.log(`  ID: ${query._id}`);
        console.log(`  Collection: ${query.collection}`);
        console.log(`  Created: ${query._created}`);
        console.log(`  Variables:`, JSON.stringify(query.variables, null, 2));
    });
    process.exit(0);
})
    .catch((error) => {
    console.error('Failed to list queries:', JSON.stringify(error));
    process.exit(1);
});
