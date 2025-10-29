import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { initSecretVaultBuilderClient } from '../client-helpers.js';
import { findContactByNameQuery } from '../query-examples.js';
async function createQuery(collectionId) {
    try {
        const builderClient = await initSecretVaultBuilderClient();
        const queryId = randomUUID();
        const queryRequest = {
            ...findContactByNameQuery,
            _id: queryId,
            collection: collectionId,
        };
        const createResponse = await builderClient.createQuery(queryRequest);
        return { _id: queryId, nodes: createResponse };
    }
    catch (error) {
        console.error('Error creating query:', error);
        throw error;
    }
}
const collectionId = process.env.NILLION_COLLECTION_ID;
if (!collectionId) {
    console.error('Missing required environment variable: NILLION_COLLECTION_ID');
    process.exit(1);
}
createQuery(collectionId)
    .then((result) => {
    console.log('Successfully created query across nodes', JSON.stringify(result, null, 2));
    process.exit(0);
})
    .catch((error) => {
    console.error('Failed to create query:', JSON.stringify(error));
    process.exit(1);
});
