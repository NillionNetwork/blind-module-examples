import 'dotenv/config';
import { NucTokenBuilder, } from '@nillion/nuc';
import { initSecretVaultBuilderClient, initSecretVaultUserClient, } from '../client-helpers.js';
async function createDelegationToken(userDid, expiresInMinutes = 1) {
    try {
        const builderClient = await initSecretVaultBuilderClient();
        const rootToken = builderClient.rootToken;
        if (!rootToken) {
            throw new Error('No root token available from builderClient');
        }
        else {
            console.log(rootToken);
        }
        const expiresInSeconds = expiresInMinutes * 60;
        // Create delegation token from builderClient to user
        // Don't specify command - let the user client add it
        const delegationToken = NucTokenBuilder.extending(rootToken)
            .audience(userDid)
            .expiresAt(Math.floor(Date.now() / 1000) + expiresInSeconds)
            .build(builderClient.keypair.privateKey());
        return {
            token: delegationToken,
            builderClient: builderClient.id,
            user: userDid.toString(),
            command: 'nil.db.data.create',
            expiresIn: `${expiresInMinutes} minute${expiresInMinutes === 1 ? '' : 's'}`,
        };
    }
    catch (error) {
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
        console.log('Successfully created delegation token', JSON.stringify(result, null, 2));
        process.exit(0);
    }
    catch (error) {
        console.error('Failed to create delegation token:', error);
        process.exit(1);
    }
}
main();
