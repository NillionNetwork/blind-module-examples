// app/api/get_credentials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createNilDBAPI } from '../../lib/nildb';
import { createEncryptionService } from '../../lib/encryption';
import { NODE_CONFIG, NUM_NODES, SCHEMA_ID } from '../../lib/config';

const NODES = Object.keys(NODE_CONFIG) as Array<keyof typeof NODE_CONFIG>;

// Services initialization
let nildbInstance: ReturnType<typeof createNilDBAPI> | null = null;
let encryptionInstance: Awaited<
  ReturnType<typeof createEncryptionService>
> | null = null;

async function initializeServices() {
  if (!nildbInstance) {
    nildbInstance = createNilDBAPI();
  }

  if (!encryptionInstance) {
    encryptionInstance = await createEncryptionService({
      nodes: NUM_NODES,
      operations: { store: true },
    });
  }

  return {
    nildb: nildbInstance,
    encryption: encryptionInstance,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { nildb, encryption } = await initializeServices();
    console.log('Services initialized');

    // Get filter from request body
    const body = await request.json();
    const { service } = body; // Optional service filter

    const allCredentials = await Promise.all(
      NODES.map((node) => nildb.retrieveCredentials(node, SCHEMA_ID, service))
    );

    console.log(
      'Credentials from nodes:',
      JSON.stringify(allCredentials, null, 2)
    );

    const credentialMap = allCredentials.flat().reduce((acc, cred) => {
      const existing = acc.get(cred._id) || {
        username: cred.username,
        service: cred.service,
        shares: [],
      };
      existing.shares.push(cred.password);
      acc.set(cred._id, existing);
      return acc;
    }, new Map<string, { username: string; service: string; shares: string[] }>());

    console.log('Credential map size:', credentialMap.size);
    console.log('Credential map keys:', Array.from(credentialMap.keys()));

    const decryptedCredentials = await Promise.all(
      Array.from(credentialMap.entries())
        .filter(([_, cred]) => cred.shares.length === NUM_NODES)
        .map(async ([id, cred]) => {
          try {
            const decrypted = {
              service: cred.service,
              username: cred.username,
              password: await encryption.decryptPassword(cred.shares),
            };
            console.log('Decrypted credential for ID:', id);
            return decrypted;
          } catch (error) {
            console.error('Failed to decrypt credential:', id, error);
            return null;
          }
        })
    );

    console.log(
      'Final decrypted credentials count:',
      decryptedCredentials.filter(Boolean).length
    );

    return NextResponse.json({
      credentials: decryptedCredentials.filter(Boolean),
    });
  } catch (error) {
    console.error('Error in get_credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
