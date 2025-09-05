import { Keypair } from '@nillion/nuc';

export function generateKeypair() {
  const keypair = Keypair.generate();
  const privateKey = keypair.privateKey('hex');
  const publicKey = keypair.publicKey('hex');
  const did = keypair.toDid().toString();
  
  return {
    keypair,
    privateKey,
    publicKey,
    did,
  };
}

async function createKeypair() {
  try {
    const result = generateKeypair();
    return result;
  } catch (error) {
    console.error('Error creating keypair:', error);
    throw error;
  }
}

createKeypair()
  .then((result) => {
    console.log('= New Keypair Generated:\n');
    console.log('Private Key (save this securely!):');
    console.log(result.privateKey);
    console.log('\nPublic Key:');
    console.log(result.publicKey);
    console.log('\nDID:');
    console.log(result.did);
    console.log('\n�  Save the private key securely! You can use it as:');
    console.log(
      '- NILLION_API_KEY for SecretVaultBuilderClient after you create a nilDB subscription'
    );
    console.log('- NILLION_USER_KEY for SecretVaultUserClient');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create keypair:', error);
    process.exit(1);
  });
