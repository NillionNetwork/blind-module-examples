import 'dotenv/config';
import { initSecretVaultBuilderClient } from '../client-helpers.js';
import type { RunQueryRequest } from '@nillion/secretvaults';

async function runQuery(queryId: string, variables: Record<string, any> = {}) {
  const builderClient = await initSecretVaultBuilderClient();

  // Run the query
  const runResponse = await builderClient.runQuery({
    _id: queryId,
    variables,
  } as RunQueryRequest);

  // Extract run IDs from responses
  const runIds = Object.fromEntries(
    Object.entries(runResponse)
      .filter(([_, r]) => r?.data)
      .map(([nodeId, r]) => [nodeId, r.data])
  );

  // Poll for results (up to 30 seconds)
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, i < 3 ? 1000 : 3000));

    const resultsResponse = await builderClient.readQueryRunResults(runIds);

    // Collect results and check status
    const allResponses = Object.values(resultsResponse).filter((r) => r?.data);
    const nodeResults = allResponses
      .filter((r) => r.data.status === 'complete' && r.data.result)
      .map((r) => r.data.result);

    // Take the first node's result (they should all be the same)
    const results = nodeResults[0] || [];

    const pending = allResponses.some((r) => r.data.status === 'pending');
    const errors = allResponses.filter((r) => r.data.status === 'error');

    if (errors.length > 0) {
      throw new Error('Query failed: ' + JSON.stringify(errors[0].data.errors));
    }

    if (!pending) {
      return results;
    }
  }

  throw new Error('Query execution timed out');
}

// Main execution
(async () => {
  const queryId = process.argv[2] || process.env.NILLION_QUERY_ID;

  if (!queryId) {
    console.error('Usage: npm run run-query <query-id> [variables-json]');
    console.error('Or set NILLION_QUERY_ID environment variable');
    process.exit(1);
  }

  // Parse variables with fallback
  let variables: Record<string, any> = { searchTerm: 'Alice' }; // fallback uses the searchContactsByPartialNameQuery query
  if (process.argv[3]) {
    try {
      variables = JSON.parse(process.argv[3]);
    } catch {
      console.error('Invalid JSON for variables');
      process.exit(1);
    }
  } else if (process.env.QUERY_VARIABLES) {
    try {
      variables = JSON.parse(process.env.QUERY_VARIABLES);
    } catch {
      console.error('Invalid JSON in QUERY_VARIABLES');
      process.exit(1);
    }
  }

  try {
    const results = await runQuery(queryId, variables);
    // For single result queries, unwrap the array
    const output = results.length === 1 ? results[0] : results;
    console.log(JSON.stringify(output, null, 2));
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
})();
