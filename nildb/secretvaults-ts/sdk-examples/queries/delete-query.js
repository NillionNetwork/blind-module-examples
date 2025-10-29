import 'dotenv/config';
import { initSecretVaultBuilderClient } from '../client-helpers.js';
async function deleteQuery(queryId) {
    try {
        const builderClient = await initSecretVaultBuilderClient();
        // First, verify the query exists
        const queryResponse = await builderClient.getQuery(queryId);
        const firstNodeData = Object.values(queryResponse)[0]?.data;
        if (!firstNodeData) {
            throw new Error(`Query ${queryId} not found`);
        }
        console.log(`Deleting query: ${firstNodeData.name} (${queryId})`);
        const deleteResponse = await builderClient.deleteQuery(queryId);
        return deleteResponse;
    }
    catch (error) {
        console.error('Error deleting query:', error);
        throw error;
    }
}
const queryId = process.env.NILLION_QUERY_ID;
if (!queryId) {
    console.error('Missing required environment variable: NILLION_QUERY_ID');
    process.exit(1);
}
deleteQuery(queryId)
    .then((result) => {
    console.log('Successfully deleted query from all nodes', JSON.stringify(result, null, 2));
    process.exit(0);
})
    .catch((error) => {
    console.error('Failed to delete query:', JSON.stringify(error));
    process.exit(1);
});
