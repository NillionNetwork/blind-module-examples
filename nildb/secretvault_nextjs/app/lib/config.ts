if (!process.env.NODE_A_URL) throw new Error('NODE_A_URL is not defined');
if (!process.env.NODE_B_URL) throw new Error('NODE_B_URL is not defined');
if (!process.env.NODE_C_URL) throw new Error('NODE_C_URL is not defined');
if (!process.env.NODE_A_JWT) throw new Error('NODE_A_JWT is not defined');
if (!process.env.NODE_B_JWT) throw new Error('NODE_B_JWT is not defined');
if (!process.env.NODE_C_JWT) throw new Error('NODE_C_JWT is not defined');
if (!process.env.SCHEMA_ID) throw new Error('SCHEMA_ID is not defined');

export const NODE_CONFIG = {
  node_a: {
    url: process.env.NODE_A_URL,
    jwt: process.env.NODE_A_JWT,
  },
  node_b: {
    url: process.env.NODE_B_URL,
    jwt: process.env.NODE_B_JWT,
  },
  node_c: {
    url: process.env.NODE_C_URL,
    jwt: process.env.NODE_C_JWT,
  },
} as const;

export const NUM_NODES = process.env.NUM_NODES;

export const SCHEMA_ID = process.env.SCHEMA_ID;
