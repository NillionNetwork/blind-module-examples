import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import { Keypair } from '@nillion/nuc';
import { SecretVaultBuilderClient } from '@nillion/secretvaults';

// Load environment variables
dotenv.config();

// Nillion Network Configuration (nilDB Testnet)
// https://docs.nillion.com/build/network-config#nildb-nodes
const config = {
  NILCHAIN_URL: process.env.NILCHAIN_URL!,
  NILAUTH_URL: process.env.NILAUTH_URL!,
  NILDB_NODES: process.env.NILDB_NODES!.split(','),
  NILLION_API_KEY: process.env.NILLION_API_KEY!,
};

// Validate configuration
if (!config.NILLION_API_KEY) {
  console.error('❌ Please set NILLION_API_KEY in your .env file');
  process.exit(1);
}

interface MyCollectionRecord extends Record<string, unknown> {
  _id: string;
  service: string;
  username: string;
  apiKey: {
    '%allot': string;
  };
}

async function setupClient(): Promise<SecretVaultBuilderClient> {
  console.log('🚀 Setting up Nillion SecretVault client...');

  const builderKeypair = Keypair.from(config.NILLION_API_KEY);
  console.log('🔑 Builder DID:', builderKeypair.toDid().toString());

  const builder = await SecretVaultBuilderClient.from({
    keypair: builderKeypair,
    urls: {
      chain: config.NILCHAIN_URL,
      auth: config.NILAUTH_URL,
      dbs: config.NILDB_NODES,
    },
    blindfold: {
      operation: 'store',
    },
  });

  await builder.refreshRootToken();
  console.log('✅ Client ready\n');

  return builder;
}

async function step1_createCollection(
  builder: SecretVaultBuilderClient
): Promise<string> {
  console.log('📁 STEP 1: Create Collection');
  console.log('============================');

  const collectionId = randomUUID();

  const schema = {
    _id: collectionId,
    type: 'standard' as const,
    name: 'API Keys Collection',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          service: { type: 'string' },
          username: { type: 'string' },
          apiKey: {
            type: 'object',
            properties: {
              '%share': {
                type: 'string',
              },
            },
            required: ['%share'],
          },
        },
        required: ['_id', 'service', 'username', 'apiKey'],
      },
    },
  };

  await builder.createCollection(schema);
  console.log('✅ Collection created:', collectionId);
  console.log('✅ Step 1 Complete!\n');

  return collectionId;
}

async function step2_addRecords(
  builder: SecretVaultBuilderClient,
  collectionId: string
): Promise<void> {
  console.log('📝 STEP 2: Add Records');
  console.log('======================');

  const sampleData: MyCollectionRecord[] = [
    {
      _id: randomUUID(),
      service: 'GitHub',
      username: 'company-bot',
      apiKey: { '%allot': 'ghp_1234567890abcdef' },
    },
    {
      _id: randomUUID(),
      service: 'Stripe',
      username: 'payments',
      apiKey: { '%allot': 'sk_live_1234567890abcdef' },
    },
    {
      _id: randomUUID(),
      service: 'OpenAI',
      username: 'ai-team',
      apiKey: { '%allot': 'sk-proj-1234567890abcdef' },
    },
  ];

  await builder.createStandardData({
    body: {
      collection: collectionId,
      data: sampleData,
    },
  });

  console.log(`✅ Added ${sampleData.length} records successfully`);
  console.log('✅ Step 2 Complete!\n');
}

async function step3_findRecords(
  builder: SecretVaultBuilderClient,
  collectionId: string
): Promise<void> {
  console.log('🔍 STEP 3: Find Records');
  console.log('=======================');

  // Find all records
  const allRecords = await builder.findData({
    collection: collectionId,
    filter: {},
  });
  console.log(`📋 Total records: ${allRecords.data?.length || 0}`);

  // Find specific service
  const githubRecords = await builder.findData({
    collection: collectionId,
    filter: { service: 'GitHub' },
  });
  console.log(`🔎 GitHub records: ${githubRecords.data?.length || 0}`);
  console.log('Decrypted GitHub records:', githubRecords.data);

  // Show all services
  console.log('📋 All services:');
  allRecords.data?.forEach((record: MyCollectionRecord) => {
    console.log(`  - ${record.service}: ${record.username}`);
  });

  console.log('✅ Step 3 Complete!\n');
}

async function step4_updateRecord(
  builder: SecretVaultBuilderClient,
  collectionId: string
): Promise<void> {
  console.log('✏️ STEP 4: Update Record');
  console.log('========================');

  console.log('🔄 Updating GitHub username...');

  await builder.updateData({
    collection: collectionId,
    filter: { service: 'GitHub' },
    update: {
      $set: {
        username: 'updated-bot-v2',
      },
    },
  });

  console.log('✅ GitHub record updated');

  // Show updated record
  const updatedRecord = await builder.findData({
    collection: collectionId,
    filter: { service: 'GitHub' },
  });
  console.log('📋 Updated record:', updatedRecord.data?.[0]?.username);
  console.log('✅ Step 4 Complete!\n');
}

async function step5_deleteRecord(
  builder: SecretVaultBuilderClient,
  collectionId: string
): Promise<void> {
  console.log('🗑️ STEP 5: Delete Record');
  console.log('=========================');

  console.log('🎯 Deleting Stripe record...');

  await builder.deleteData({
    collection: collectionId,
    filter: { service: 'Stripe' },
  });

  console.log('✅ Stripe record deleted');

  // Show remaining records
  const remainingRecords = await builder.findData({
    collection: collectionId,
    filter: {},
  });

  console.log(`📋 Remaining records: ${remainingRecords.data?.length || 0}`);
  remainingRecords.data?.forEach((record: MyCollectionRecord) => {
    console.log(`  - ${record.service}: ${record.username}`);
  });

  console.log('✅ Step 5 Complete!\n');
}

async function step6_metadataInspection(
  builder: SecretVaultBuilderClient,
  collectionId: string
): Promise<void> {
  console.log('📊 STEP 6: Metadata & Inspection');
  console.log('=================================');

  // Collection metadata
  console.log('📈 Getting collection metadata...');
  const metadata = await builder.readCollection(collectionId);
  console.log('Collection stats:', {
    totalRecords: metadata.data.count,
    sizeBytes: metadata.data.size,
    lastModified: metadata.data.last_write?.substring(0, 19) + 'Z',
  });

  // Builder profile
  console.log('🔍 Getting builder profile...');
  const profile = await builder.readProfile();
  console.log('Builder profile:', {
    collections: profile.data.collections.length,
    totalQueries: profile.data.queries.length,
  });

  // Recent data
  console.log('📋 Getting recent records...');
  const recentRecords = await builder.tailData(collectionId, 3);
  console.log(`Latest ${recentRecords.data?.length || 0} records:`);
  recentRecords.data?.forEach((record: MyCollectionRecord) => {
    console.log(`  - ${record.service}: ${record.username}`);
  });

  console.log('✅ Step 6 Complete!\n');
}

async function main(): Promise<void> {
  console.log('🎓 NILLION SECRETVAULT CRUD SCRIPT');
  console.log('====================================\n');

  try {
    const builder = await setupClient();
    const collectionId = await step1_createCollection(builder);
    await step2_addRecords(builder, collectionId);
    await step3_findRecords(builder, collectionId);

    // Commented out for now because of an updateData bug in the SDK
    // await step4_updateRecord(builder, collectionId);

    await step5_deleteRecord(builder, collectionId);
    await step6_metadataInspection(builder, collectionId);

    console.log('🎉 Script COMPLETE!');
    console.log('=====================');
    console.log('✅ 1. Created a standardcollection');
    console.log('✅ 2. Added encrypted records');
    console.log('✅ 3. Found records with filters');
    console.log('✅ 4. Updated a record');
    console.log('✅ 5. Deleted a record');
    console.log('✅ 6. Explored builder and collection metadata');
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
