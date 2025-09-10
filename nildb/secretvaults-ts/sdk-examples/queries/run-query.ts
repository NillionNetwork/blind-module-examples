import 'dotenv/config';
import { initSecretVaultBuilderClient } from '../client-helpers.js';
import type { RunQueryRequest, RunQueryResultStatus } from '@nillion/secretvaults';

async function runQuery(queryId: string, searchName: string = 'Sample Item 1') {
  try {
    const builderClient = await initSecretVaultBuilderClient();
    
    // Run the query with variables
    const runQueryRequest: RunQueryRequest = {
      _id: queryId,
      variables: { name: searchName }
    };
    
    console.log(`Running query ${queryId} with name="${searchName}"`);
    const runResponse = await builderClient.runQuery(runQueryRequest);
    
    // Extract run IDs from all nodes
    const runIds: Record<string, string> = {};
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
      const results: any[] = [];
      
      for (const [nodeId, response] of Object.entries(resultsResponse)) {
        if (response?.data) {
          const status: RunQueryResultStatus = response.data.status;
          console.log(`Node ${nodeId.slice(0, 8)}... status: ${status}`);
          
          if (status === 'complete') {
            if (response.data.result) {
              results.push(response.data.result);
            }
          } else if (status === 'error') {
            hasError = true;
            console.error(`Error on node ${nodeId}:`, response.data.errors);
          } else {
            allCompleted = false;
          }
        }
      }
      
      if (allCompleted || hasError) {
        if (hasError) {
          throw new Error('Query execution failed on one or more nodes');
        }
        
        // Unify results if key is available
        if (builderClient.options.key && results.length > 0) {
          console.log('\nUnifying concealed data from all nodes...');
          // In a real scenario, you would unify the shares here
          // For now, we'll just return the first result
          return results[0];
        }
        
        return results;
      }
      
      attempt++;
    }
    
    throw new Error('Query execution timed out');
    
  } catch (error) {
    console.error('Error running query:', error);
    throw error;
  }
}

const queryId = process.env.NILLION_QUERY_ID;
const searchName = process.env.SEARCH_NAME || 'Sample Item 1';

if (!queryId) {
  console.error('Missing required environment variable: NILLION_QUERY_ID');
  process.exit(1);
}

runQuery(queryId, searchName)
  .then((result) => {
    console.log(
      '\nQuery completed successfully. Results:',
      JSON.stringify(result, null, 2)
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to run query:', JSON.stringify(error));
    process.exit(1);
  });