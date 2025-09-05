import 'dotenv/config';
import { initSecretVaultUserClient } from '../client-helpers.js';
import { GrantAccessToDataRequest, AclDto } from '@nillion/secretvaults';

async function grantAccess(
  collectionId: string,
  documentId: string,
  granteeDid: string
) {
  try {
    const userClient = await initSecretVaultUserClient();

    // Create ACL for the grantee
    const acl: AclDto = {
      grantee: granteeDid,
      read: true,
      write: true,
      execute: true,
    };

    const grantRequest: GrantAccessToDataRequest = {
      collection: collectionId,
      document: documentId,
      acl: acl,
    };

    const grantResponse = await userClient.grantAccess(grantRequest);

    return {
      collection: collectionId,
      document: documentId,
      grantee: granteeDid,
      permissions: acl,
      nodes: grantResponse,
    };
  } catch (error) {
    console.error('Error granting access:', error);
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
    console.error('- NILLION_GRANTEE_DID (DID to grant access to)');
  process.exit(1);
}

grantAccess(collectionId, documentId, granteeDid)
  .then((result) => {
    console.log('Successfully granted access', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to grant access:', JSON.stringify(error));
    process.exit(1);
  });
