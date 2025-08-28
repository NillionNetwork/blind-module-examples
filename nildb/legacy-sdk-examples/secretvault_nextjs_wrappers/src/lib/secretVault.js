import { SecretVaultWrapper } from 'secretvaults';

const orgConfig = {
  orgCredentials: {
    secretKey:
      process.env.ORG_SECRET_KEY ||
      '0ac97ffdd83769c6c5032cb202d0957800e0ef151f015b0aaec52e2d864d4fc6',
    orgDid:
      process.env.ORG_DID ||
      'did:nil:testnet:nillion1v596szek38l22jm9et4r4j7txu3v7eff3uffue',
  },
  nodes: [
    {
      url: 'https://nildb-nx8v.nillion.network',
      did: 'did:nil:testnet:nillion1qfrl8nje3nvwh6cryj63mz2y6gsdptvn07nx8v',
    },
    {
      url: 'https://nildb-p3mx.nillion.network',
      did: 'did:nil:testnet:nillion1uak7fgsp69kzfhdd6lfqv69fnzh3lprg2mp3mx',
    },
    {
      url: 'https://nildb-rugk.nillion.network',
      did: 'did:nil:testnet:nillion1kfremrp2mryxrynx66etjl8s7wazxc3rssrugk',
    },
  ],
};

// Keep a single instance of the wrapper
let svWrapper = null;

export async function createSchema() {
  const org = new SecretVaultWrapper(orgConfig.nodes, orgConfig.orgCredentials);
  await org.init();

  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Web3 Experience Survey',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          format: 'uuid',
          coerce: true,
        },
        years_in_web3: {
          type: 'object',
          properties: {
            '%share': {
              type: 'string',
            },
          },
          required: ['%share'],
        },
        responses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              rating: {
                type: 'integer',
                minimum: 1,
                maximum: 5,
              },
              question_number: {
                type: 'integer',
                minimum: 1,
              },
            },
            required: ['rating', 'question_number'],
          },
          minItems: 1,
        },
      },
      required: ['_id', 'years_in_web3', 'responses'],
    },
  };

  const newSchema = await org.createSchema(schema, 'Web3 Experience Survey');
  return newSchema;
}

export async function getCollection(schemaId) {
  if (!svWrapper) {
    svWrapper = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      schemaId
    );
    await svWrapper.init();
  }
  return svWrapper;
}

export async function writeSurveyData(schemaId, data) {
  const collection = await getCollection(schemaId);
  return collection.writeToNodes(data);
}

export async function readSurveyData(schemaId, query = {}) {
  const collection = await getCollection(schemaId);
  return collection.readFromNodes(query);
}
