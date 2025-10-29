import 'dotenv/config';
import { initSecretVaultUserClient } from '../client-helpers.js';
async function deleteOwnedRecord(collectionId, documentId) {
    try {
        const userClient = await initSecretVaultUserClient();
        const deleteParams = {
            collection: collectionId,
            document: documentId,
        };
        const deleteResponse = await userClient.deleteData(deleteParams);
        return {
            collection: collectionId,
            document: documentId,
            deleted: true,
            nodes: deleteResponse,
        };
    }
    catch (error) {
        console.error('Error deleting owned data:', error);
        throw error;
    }
}
// Get inputs from environment variables
const collectionId = process.env.NILLION_OWNED_COLLECTION_ID;
const documentId = process.env.NILLION_OWNED_RECORD_ID;
if (!collectionId || !documentId) {
    console.error('Missing required environment variables:');
    if (!collectionId)
        console.error('- NILLION_OWNED_COLLECTION_ID');
    if (!documentId)
        console.error('- NILLION_OWNED_RECORD_ID');
    process.exit(1);
}
// Confirm deletion
console.log(`⚠️  Warning: This will permanently delete document ${documentId}`);
console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...');
setTimeout(() => {
    deleteOwnedRecord(collectionId, documentId)
        .then((result) => {
        console.log('Successfully deleted owned data', JSON.stringify(result, null, 2));
        process.exit(0);
    })
        .catch((error) => {
        console.error('Failed to delete owned data:', JSON.stringify(error));
        process.exit(1);
    });
}, 3000);
