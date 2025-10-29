import 'dotenv/config';
import { initSecretVaultBuilderClient } from '../client-helpers.js';
async function runQuery(queryId, variables = {}) {
    try {
        const builderClient = await initSecretVaultBuilderClient();
        // Run the query with variables
        const runQueryRequest = {
            _id: queryId,
            variables
        };
        console.log(`Running query ${queryId} with variables:`, variables);
        const runResponse = await builderClient.runQuery(runQueryRequest);
        // Extract run IDs from all nodes
        const runIds = {};
        Object.entries(runResponse).forEach(([nodeId, response]) => {
            if (response?.data) {
                runIds[nodeId] = response.data;
            }
        });
        console.log('Query execution started. Run IDs:', runIds);
        // Poll for results with retry logic
        const retryIntervals = [1000, 2000, 5000, 10000, 30000]; // ms
        let attempt = 0;
        while (attempt < retryIntervals.length) {
            await new Promise(resolve => setTimeout(resolve, retryIntervals[attempt]));
            console.log(`\nAttempt ${attempt + 1}: Checking query status...`);
            const resultsResponse = await builderClient.readQueryRunResults(runIds);
            let allCompleted = true;
            let hasError = false;
            const results = [];
            for (const [nodeId, response] of Object.entries(resultsResponse)) {
                if (response?.data) {
                    const status = response.data.status;
                    console.log(`Node ${nodeId.slice(0, 8)}... status: ${status}`);
                    if (status === 'complete') {
                        if (response.data.result) {
                            results.push(response.data.result);
                        }
                    }
                    else if (status === 'error') {
                        hasError = true;
                        console.error(`Error on node ${nodeId}:`, response.data.errors);
                    }
                    else {
                        allCompleted = false;
                    }
                }
            }
            if (allCompleted || hasError) {
                if (hasError) {
                    throw new Error('Query execution failed on one or more nodes');
                }
                // Return results
                console.log('\nQuery execution completed successfully.');
                return results.length === 1 ? results[0] : results;
            }
            attempt++;
        }
        throw new Error('Query execution timed out');
    }
    catch (error) {
        console.error('Error running query:', error);
        throw error;
    }
}
// Parse command line arguments or use environment variables
const queryId = process.argv[2] || process.env.NILLION_QUERY_ID;
if (!queryId) {
    console.error('Usage: tsx run-query.ts <query-id> [variables-as-json]');
    console.error('Or set NILLION_QUERY_ID environment variable');
    console.error('\nExample: tsx run-query.ts abc123 \'{"name": "Alice Johnson"}\'');
    process.exit(1);
}
// Parse variables from command line or environment
let variables = {};
if (process.argv[3]) {
    try {
        variables = JSON.parse(process.argv[3]);
    }
    catch (error) {
        console.error('Invalid JSON for variables:', process.argv[3]);
        process.exit(1);
    }
}
else if (process.env.QUERY_VARIABLES) {
    try {
        variables = JSON.parse(process.env.QUERY_VARIABLES);
    }
    catch (error) {
        console.error('Invalid JSON in QUERY_VARIABLES environment variable');
        process.exit(1);
    }
}
console.log('=== Running SecretVaults Query ===\n');
runQuery(queryId, variables)
    .then((result) => {
    console.log('\nQuery Results:', JSON.stringify(result, null, 2));
    process.exit(0);
})
    .catch((error) => {
    console.error('Failed to run query:', error.message || JSON.stringify(error));
    process.exit(1);
});
