import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Keypair, NucTokenBuilder } from '@nillion/nuc';
import { CreateOwnedDataRequest, AclDto } from '@nillion/secretvaults';
import {
  initSecretVaultBuilderClient,
  initSecretVaultUserClient,
} from '../client-helpers.js';
import { contactBookSchema } from '../schema-examples.js';

async function fullOwnedDataExample() {
  console.log('🚀 Starting Full Owned Data Example\n');

  try {
    // Step 1: Initialize builder client from env
    console.log('1️⃣ Initializing builder client...');
    const builder = await initSecretVaultBuilderClient();
    console.log('✅ Builder initialized:', builder.id);

    // Step 2: Create a new user keypair
    console.log('\n2️⃣ Creating new user keypair...');
    const userKeypair = Keypair.generate();
    const userPrivateKey = userKeypair.privateKey('hex');
    const userDid = userKeypair.toDid();
    console.log('✅ User created with DID:', userDid.toString());
    console.log('✅ User private key:', userPrivateKey);

    // Step 3: Initialize user client
    console.log('\n3️⃣ Initializing user client...');
    const userClient = await initSecretVaultUserClient(userPrivateKey);
    console.log('✅ User client initialized');

    // Step 4: Create owned collection (inline logic from create-owned-collection.ts)
    console.log('\n4️⃣ Creating owned collection...');
    const collectionId = randomUUID();
    const newOwnedCollection = await builder.createCollection({
      _id: collectionId,
      type: 'owned',
      name: 'Owned Contact Book - Full Example',
      schema: contactBookSchema,
    });
    console.log('✅ Owned collection created:', collectionId);

    // Step 5: Create delegation token for user (inline logic from create-delegation-token.ts)
    console.log('\n5️⃣ Creating delegation token for user...');
    const rootToken = builder.rootToken;
    if (!rootToken) {
      throw new Error('No root token available from builder');
    }

    const expiresInMinutes = 60;
    const expiresInSeconds = expiresInMinutes * 60;
    const delegationToken = NucTokenBuilder.extending(rootToken)
      .audience(userDid)
      .expiresAt(Math.floor(Date.now() / 1000) + expiresInSeconds)
      .build(builder.keypair.privateKey());
    const tokenString = delegationToken.toString();
    console.log(
      '✅ Delegation token created (expires in 60 minutes)',
      tokenString
    );

    // Step 6: User creates owned data with read permissions for builder (inline logic from create-owned-data.ts)
    console.log('\n6️⃣ User creating owned data...');

    const userData = [
      {
        _id: randomUUID(),
        'first name': 'OWNED! Steph',
        'phone number': {
          '%allot': 'OWNED! 555-0001', // encrypted field
        },
      },
    ];

    // Create ACL to grant access
    const acl: AclDto = {
      grantee: builder.id,
      read: false,
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
      tokenString,
      createDataRequest
    );

    // Extract the created document IDs from response
    const createdIds = [];
    for (const [nodeId, nodeResponse] of Object.entries(createResponse)) {
      if (nodeResponse.data?.created) {
        createdIds.push(...nodeResponse.data.created);
      }
    }

    const recordId = createdIds[0];
    console.log('✅ Owned data created with ID:', recordId);
    console.log('   - Owner:', userClient.id);
    console.log('   - Granted access to:', builder.id);

    // Step 7: Owner reads all records in the collection
    console.log('\n7️⃣ Owner listing all owned records...');
    const referencesResponse = await userClient.listDataReferences();

    if (referencesResponse.data && referencesResponse.data.length > 0) {
      console.log(
        `✅ Found ${referencesResponse.data.length} owned record(s):`
      );

      for (const ref of referencesResponse.data) {
        if (ref.collection === collectionId) {
          console.log(`\n   📄 Record: ${ref.document || ref.id}`);
          console.log(`      Collection: ${ref.collection}`);
          console.log(`      Builder: ${ref.builder}`);

          // Read the actual data
          const record = await userClient.readData({
            collection: ref.collection,
            document: ref.document || ref.id,
          });

          console.log('      Data:', JSON.stringify(record.data, null, 2));
        }
      }
    } else {
      console.log('   No owned records found');
    }

    // Step 8: Summary
    console.log('\n✨ Full Example Complete!');
    console.log('   - Builder created owned collection:', collectionId);
    console.log('   - Builder issued delegation token to user');
    console.log('   - User created owned data with ID:', recordId);
    console.log('   - User granted read access to builder');
    console.log('   - Owner successfully read all records');

    console.log('\n🔗 The builder can view the collection in the explorer:');
    console.log(
      `   https://collection-explorer.nillion.com/collections/${collectionId}`
    );

    return {
      collectionId,
      recordId,
      userDid: userDid.toString(),
      builderDid: builder.id,
    };
  } catch (error) {
    console.error('\n❌ Error in full example:', error);
    throw error;
  }
}

// Run the example
fullOwnedDataExample()
  .then((result) => {
    console.log('\n📊 Results:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to complete example:', error);
    process.exit(1);
  });
