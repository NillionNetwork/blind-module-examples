// generate.js
// npm install did-jwt
// run it via node (node generate.js)

const { createJWT, ES256KSigner } = require('did-jwt');
const { Buffer } = require('buffer');

/**
 * Create JWTs signed with ES256K for multiple node_ids
 * @param {string} secretKey - Hex string of the private key
 * @param {string} orgDid - Organization DID
 * @param {string[]} nodeIds - Array of node DIDs
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<string[]>} Array of JWT tokens
 */
async function createJwt(secretKey, orgDid, nodeIds, ttl = 3600) {
  // Create signer from private key
  const signer = ES256KSigner(Buffer.from(secretKey, 'hex'));
  const tokens = [];

  for (const nodeId of nodeIds) {
    const payload = {
      iss: orgDid,
      aud: nodeId,
      exp: Math.floor(Date.now() / 1000) + ttl,
    };

    const token = await createJWT(payload, { issuer: orgDid, signer });
    tokens.push(token);
    console.log(`Generated JWT for ${nodeId}: ${token}`);
  }

  return tokens;
}

// Example usage
// Replace SECRET_KEY and ORG_DID with your own values
async function main() {
  const secretKey = 'did:nil:testnet:nillionXXX';
  const orgDid = 'XXX';
  const nodeIds = [
    'did:nil:testnet:nillion1qfrl8nje3nvwh6cryj63mz2y6gsdptvn07nx8v',
    'did:nil:testnet:nillion1uak7fgsp69kzfhdd6lfqv69fnzh3lprg2mp3mx',
    'did:nil:testnet:nillion1kfremrp2mryxrynx66etjl8s7wazxc3rssrugk',
  ];

  await createJwt(secretKey, orgDid, nodeIds);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createJwt };
