export const config = {
  NILCHAIN_URL: process.env.NILCHAIN_URL!,
  NILAUTH_URL: process.env.NILAUTH_URL!,
  NILDB_NODES: process.env.NILDB_NODES!.split(','),
  NILLION_API_KEY: process.env.NILLION_API_KEY!,
};

export function validateConfig() {
  if (!config.NILLION_API_KEY) {
    throw new Error('NILLION_API_KEY is required in environment variables');
  }
  if (!config.NILCHAIN_URL) {
    throw new Error('NILCHAIN_URL is required in environment variables');
  }
  if (!config.NILAUTH_URL) {
    throw new Error('NILAUTH_URL is required in environment variables');
  }
  if (!config.NILDB_NODES || config.NILDB_NODES.length === 0) {
    throw new Error('NILDB_NODES is required in environment variables');
  }
}