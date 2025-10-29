import 'dotenv/config';
import { initSecretVaultUserClient } from '../client-helpers.js';
async function readOwnedRecord(collectionId, recordId) {
    try {
        const userClient = await initSecretVaultUserClient();
        const params = {
            collection: collectionId,
            document: recordId, // API parameter is still 'document'
        };
        const record = await userClient.readData(params);
        return {
            collection: collectionId,
            record: recordId,
            data: record.data,
        };
    }
    catch (error) {
        console.error('Error reading owned record:', error);
        throw error;
    }
}
// Get inputs from environment variables
const collectionId = process.env.NILLION_OWNED_COLLECTION_ID;
const recordId = process.env.NILLION_OWNED_RECORD_ID;
if (!collectionId || !recordId) {
    console.error('Missing required environment variables:');
    if (!collectionId)
        console.error('- NILLION_OWNED_COLLECTION_ID');
    if (!recordId)
        console.error('- NILLION_OWNED_RECORD_ID');
    process.exit(1);
}
readOwnedRecord(collectionId, recordId)
    .then((result) => {
    console.log('Successfully read owned record', JSON.stringify(result, null, 2));
    process.exit(0);
})
    .catch((error) => {
    console.error('Failed to read owned record:', JSON.stringify(error));
    process.exit(1);
});
