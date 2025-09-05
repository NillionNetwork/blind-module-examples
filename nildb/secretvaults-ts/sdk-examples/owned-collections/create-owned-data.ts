import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { initSecretVaultUserClient } from '../client-helpers.js';
import { AclDto, CreateOwnedDataRequest } from '@nillion/secretvaults';

async function createOwnedData(
  collectionId: string,
  delegationToken: string,
  granteeDid: string
) {
  try {
    // Initialize user client
    const userClient = await initSecretVaultUserClient();

    const userData = [
      {
        _id: randomUUID(),
        'first name': 'OWNED! Steph',
        'phone number': {
          '%allot': '555-555-5555', // field marked with %allot will be encrypted
        },
      },
    ];

    // Create ACL to grant access
    const acl: AclDto = {
      grantee: granteeDid,
      read: true,
      write: false,
      execute: false,
    };

    // Create the owned data request
    const createDataRequest: CreateOwnedDataRequest = {
      collection: collectionId,
      owner: userClient.id,
      data: userData,
      acl: acl,
    };

    // Create data using delegation token
    const createResponse = await userClient.createData(
      delegationToken,
      createDataRequest
    );

    // Extract the created document IDs from response
    const createdIds = [];
    for (const [nodeId, nodeResponse] of Object.entries(createResponse)) {
      if (nodeResponse.data?.created) {
        createdIds.push(...nodeResponse.data.created);
      }
    }

    return {
      collection: collectionId,
      owner: userClient.id,
      createdIds: [...new Set(createdIds)], // Remove duplicates
      nodes: createResponse,
    };
  } catch (error) {
    console.error('Error creating owned data:', error);
    throw error;
  }
}

// Get inputs from environment variables
const collectionId = process.env.NILLION_OWNED_COLLECTION_ID;
const delegationToken = process.env.NILLION_DELEGATION_TOKEN;
const granteeDid = process.env.NILLION_GRANTEE_DID;

if (!collectionId || !delegationToken || !granteeDid) {
  console.error('Missing required environment variables:');
  if (!collectionId)
    console.error('- NILLION_OWNED_COLLECTION_ID (owned collection ID)');
  if (!delegationToken)
    console.error(
      '- NILLION_DELEGATION_TOKEN (from create-delegation-token script)'
    );
  if (!granteeDid)
    console.error(
      '- NILLION_GRANTEE_DID (DID to grant access to, e.g., builderClient DID)'
    );
  process.exit(1);
}

createOwnedData(collectionId, delegationToken, granteeDid)
  .then((result) => {
    console.log(
      'Successfully created owned data',
      JSON.stringify(result, null, 2)
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create owned data:', JSON.stringify(error));
    process.exit(1);
  });
