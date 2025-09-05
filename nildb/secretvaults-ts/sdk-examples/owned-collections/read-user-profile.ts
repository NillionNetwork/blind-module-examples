import 'dotenv/config';
import { initSecretVaultUserClient } from '../client-helpers.js';

async function readUserProfile() {
  try {
    const userClient = await initSecretVaultUserClient();

    console.log('Reading user profile for:', userClient.id);

    const profileResponse = await userClient.readProfile();

    return profileResponse.data;
  } catch (error) {
    // Check if it's an authorization error or profile doesn't exist
    if (Array.isArray(error) && error.some((e) => e?.error?.status === 401)) {
      console.log(
        'User profile not found. Create owned data first to establish profile.'
      );
      return null;
    }
    console.error('Error reading user profile:', error);
    throw error;
  }
}

readUserProfile()
  .then((result) => {
    if (result) {
      console.log(
        'User profile retrieved successfully',
        JSON.stringify(result, null, 2)
      );
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to read user profile:', JSON.stringify(error));
    process.exit(1);
  });
