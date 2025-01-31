// lib/nildb.ts
import { NODE_CONFIG, NUM_NODES, SCHEMA_ID } from './config';

export type NodeName = keyof typeof NODE_CONFIG;

export interface Credential {
  _id: string;
  username: string;
  password: string;
  service: string;
  registered_at: string;
}

interface CredentialPayload {
  schema: string;
  data: Credential;
}

interface NodeResponse<T> {
  data?: T;
  error?: string;
}

export const createNilDBAPI = (config = NODE_CONFIG) => {
  const uploadCredential = async (
    nodeName: NodeName,
    credentialData: CredentialPayload
  ): Promise<boolean> => {
    const node = config[nodeName];

    try {
      const response = await fetch(`${node.url}/api/v1/data/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${node.jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schema: credentialData.schema,
          data: [credentialData.data],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Error creating credential in ${String(nodeName)}:`, error);
      return false;
    }
  };

  const retrieveCredentials = async (
    nodeName: NodeName,
    schema: string,
    service?: string
  ): Promise<Credential[]> => {
    const node = config[nodeName];

    try {
      const response = await fetch(`${node.url}/api/v1/data/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${node.jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schema,
          filter: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = (await response.json()) as NodeResponse<Credential[]>;
      return result.data || [];
    } catch (error) {
      console.error(`Error reading credentials from ${nodeName}:`, error);
      return [];
    }
  };

  return {
    uploadCredential,
    retrieveCredentials,
    config,
    NUM_NODES,
    SCHEMA_ID,
  } as const;
};

export type NilDB = ReturnType<typeof createNilDBAPI>;
