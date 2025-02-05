import dotenv from 'dotenv';
dotenv.config();

const NILLION_NETWORK = process.env.NILLION_NETWORK || 'Devnet';
export const NILLION_USER_KEY_SEED = process.env.NILLION_USER_KEY_SEED;
export const NILLION_NILCHAIN_PRIVATE_KEY =
  process.env.NILLION_NILCHAIN_PRIVATE_KEY;

const NillionNetworkConfig = {
  // local nillion-devnet
  Devnet: {
    NILLION_GRPC_ENDPOINT: 'http://127.0.0.1:37939',
    NILLION_NILCHAIN_JSON_RPC: 'http://127.0.0.1:48102',
  },
  Qa: {
    NILLION_GRPC_ENDPOINT:
      'https://node-1.qa.nillion-network.nilogy.xyz:14311/',
    NILLION_NILCHAIN_JSON_RPC:
      'http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz',
  },
  Photon2: {
    NILLION_GRPC_ENDPOINT:
      'https://node-1.photon2.nillion-network.nilogy.xyz:14311/',
    NILLION_NILCHAIN_JSON_RPC:
      'http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz',
  },
};

const networkConfig = NillionNetworkConfig[NILLION_NETWORK];

export { networkConfig };
