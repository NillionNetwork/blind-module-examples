import 'dotenv/config';
import { initSecretVaultUserClient } from '../client-helpers.js';
import { RevokeAccessToDataRequest } from '@nillion/secretvaults';

// Note: Only the owner of the document can revoke access
// If you get a 401 RevokeAccessError, ensure:
// 1. The NILLION_USER_KEY belongs to the document owner
// 2. The collection and document IDs are correct
// 3. Access was previously granted to the grantee DID

async function revokeAccess(
  collectionId: string,
  documentId: string,
  granteeDid: string
) {
  try {
    const userClient = await initSecretVaultUserClient();

    const revokeRequest: RevokeAccessToDataRequest = {
      collection: collectionId,
      document: documentId,
      grantee: granteeDid,
    };

    const revokeResponse = await userClient.revokeAccess(revokeRequest);

    return {
      collection: collectionId,
      document: documentId,
      revokedFrom: granteeDid,
      nodes: revokeResponse,
    };
  } catch (error) {
    console.error('Error revoking access:', error);
    throw error;
  }
}

// Get inputs from environment variables
const collectionId = process.env.NILLION_OWNED_COLLECTION_ID;
const documentId = process.env.NILLION_OWNED_RECORD_ID;
const granteeDid = process.env.NILLION_GRANTEE_DID;

if (!collectionId || !documentId || !granteeDid) {
  console.error('Missing required environment variables:');
  if (!collectionId) console.error('- NILLION_OWNED_COLLECTION_ID');
  if (!documentId) console.error('- NILLION_OWNED_RECORD_ID');
  if (!granteeDid)
    console.error('- NILLION_GRANTEE_DID (DID to revoke access from)');
  process.exit(1);
}

revokeAccess(collectionId, documentId, granteeDid)
  .then((result) => {
    console.log('Successfully revoked access', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to revoke access:', JSON.stringify(error));
    process.exit(1);
  });
