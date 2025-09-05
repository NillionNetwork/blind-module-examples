import 'dotenv/config';
import { initSecretVaultUserClient } from '../client-helpers.js';

export async function checkUserIdentity() {
  try {
    const userClient = await initSecretVaultUserClient();

    // Get node details with URL from about info
    const nodeDetails = await Promise.all(
      userClient.nodes.map(async (node) => {
        try {
          const about = await node.aboutNode();
          return {
            did: node.id.toString(),
            url: about.url,
          };
        } catch (error) {
          return {
            id: node.id.toString(),
            url: null,
          };
        }
      })
    );

    const identityInfo = {
      did: userClient.did,
      publicKey: Buffer.from(userClient.keypair.publicKey()).toString('hex'),
      nodes: nodeDetails,
    };

    return identityInfo;
  } catch (error) {
    console.error('Error checking user identity:', error);
    throw error;
  }
}

checkUserIdentity()
  .then((result) => {
    console.log(
      'User identity information retrieved successfully',
      JSON.stringify(result, null, 2)
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to check user identity:', JSON.stringify(error));
    process.exit(1);
  });
