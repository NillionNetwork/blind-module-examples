// app/api/get_credentials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createNilDBAPI } from '../../lib/nildb';
import { createEncryptionService } from '../../lib/encryption';
import { NODE_CONFIG, NUM_NODES, SCHEMA_ID } from '../../lib/config';

export async function POST(request: NextRequest) {
  try {
    // Initialize services
    const nildb = createNilDBAPI();
    const encryption = await createEncryptionService({
      nodes: Number(NUM_NODES),
      operations: { store: true },
    });
    console.log('Services initialized');

    // Parse request body
    const { service } = await request.json();
    console.log('Request body:', { service });

    // Fetch credentials from all nodes
    const nodeNames = Object.keys(NODE_CONFIG) as Array<
      keyof typeof NODE_CONFIG
    >;
    const credentialPromises = nodeNames.map((node) =>
      nildb.retrieveCredentials(node, SCHEMA_ID, service)
    );

    const allCredentialsArrays = await Promise.all(credentialPromises);
    const allCredentials = allCredentialsArrays.flat();
    console.log(`Fetched ${allCredentials.length} credentials`);

    // Aggregate credentials by _id
    const credentialMap = new Map<
      string,
      { username: string; service: string; shares: string[] }
    >();
    for (const cred of allCredentials) {
      if (!credentialMap.has(cred._id)) {
        credentialMap.set(cred._id, {
          username: cred.username,
          service: cred.service,
          shares: [],
        });
      }
      credentialMap.get(cred._id)!.shares.push(cred.password);
    }

    // Decrypt credentials where shares count matches NUM_NODES
    const decryptedCredentials: Array<{
      service: string;
      username: string;
      password: string;
    }> = [];
    for (const [id, cred] of credentialMap.entries()) {
      if (cred.shares.length === Number(NUM_NODES)) {
        try {
          const password = await encryption.decryptPassword(cred.shares);
          decryptedCredentials.push({
            service: cred.service,
            username: cred.username,
            password,
          });
          console.log(`Decrypted credential for ID: ${id}`);
        } catch (error) {
          console.error(`Failed to decrypt credential ${id}:`, error);
        }
      } else {
        console.warn(
          `Incomplete shares for credential ${id}: expected ${NUM_NODES}, got ${cred.shares.length}`
        );
      }
    }

    console.log(
      `Returning ${decryptedCredentials.length} decrypted credentials`
    );

    return NextResponse.json({ credentials: decryptedCredentials });
  } catch (error) {
    console.error('Error in get_credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
