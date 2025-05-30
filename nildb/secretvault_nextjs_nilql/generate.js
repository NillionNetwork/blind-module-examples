// Use this to generate JWT Token
const { createJWT, ES256KSigner } = require('did-jwt');
const { Buffer } = require('buffer');

// Creating the JWT Token
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
async function main() {
  const secretKey = 'XXX';
  const orgDid = 'did:nil:testnet:nillionXXX';
  const nodeIds = [
    'did:nil:testnet:nillionXXX',
    'did:nil:testnet:nillionXXX',
    'did:nil:testnet:nillionXXX',
  ];

  await createJwt(secretKey, orgDid, nodeIds);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createJwt };
