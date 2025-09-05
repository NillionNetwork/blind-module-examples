import 'dotenv/config';
import {
  NucTokenBuilder,
  InvocationBody,
  NucTokenEnvelopeSchema,
  Did,
} from '@nillion/nuc';
import {
  initSecretVaultBuilderClient,
  initSecretVaultUserClient,
} from '../client-helpers.js';
import { NucCmd } from '@nillion/secretvaults';

async function createDelegationToken(
  userDid: Did,
  expiresInMinutes: number = 1
) {
  try {
    const builder = await initSecretVaultBuilderClient();
    const rootToken = builder.rootToken;
    if (!rootToken) {
      throw new Error('No root token available from builder');
    } else {
      console.log(rootToken);
    }

    const expiresInSeconds = expiresInMinutes * 60;

    // Create delegation token from builder to user
    // Don't specify command - let the user client add it
    const delegationToken = NucTokenBuilder.extending(rootToken)
      .audience(userDid)
      .expiresAt(Math.floor(Date.now() / 1000) + expiresInSeconds)
      .build(builder.keypair.privateKey());

    return {
      token: delegationToken,
      builder: builder.id,
      user: userDid.toString(),
      command: 'nil.db.data.create',
      expiresIn: `${expiresInMinutes} minute${
        expiresInMinutes === 1 ? '' : 's'
      }`,
    };
  } catch (error) {
    console.error('Error creating delegation token:', error);
    throw error;
  }
}

async function main() {
  try {
    // Initialize user client to get the DID
    const userClient = await initSecretVaultUserClient();
    const userDid = userClient.did;

    // Create delegation token
    const result = await createDelegationToken(userDid, 500);

    console.log(
      'Successfully created delegation token',
      JSON.stringify(result, null, 2)
    );
    process.exit(0);
  } catch (error) {
    console.error('Failed to create delegation token:', error);
    process.exit(1);
  }
}

main();
