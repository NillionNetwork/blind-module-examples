import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createNilDBAPI } from '../../lib/nildb';
import { createEncryptionService } from '../../lib/encryption';
import { NODE_CONFIG, NUM_NODES, SCHEMA_ID } from '../../lib/config';

const NODES = Object.keys(NODE_CONFIG) as Array<keyof typeof NODE_CONFIG>;

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
      nodes: Number(NUM_NODES),
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
    const body = await request.json();

    if (!body?.username || !body?.password || !body?.service) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const credId = uuidv4();
    const encryptedShares = await encryption.encryptPassword(body.password);

    const results = await Promise.all(
      NODES.map((node, index) =>
        nildb.uploadCredential(node, {
          schema: SCHEMA_ID,
          data: {
            _id: credId,
            username: body.username,
            password: encryptedShares[index],
            service: body.service,
            registered_at: body.registered_at,
          },
        })
      )
    );

    if (results.every(Boolean)) {
      return NextResponse.json({ success: true, id: credId });
    }

    return NextResponse.json(
      { error: 'Failed to store credential' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error creating credential:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
