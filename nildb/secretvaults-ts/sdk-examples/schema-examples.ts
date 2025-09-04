export const contactBookSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        description: 'Unique identifier',
      },
      'first name': {
        type: 'string',
      },
      'phone number': {
        type: 'object',
        properties: {
          '%share': {
            type: 'string',
          },
        },
        required: ['%share'],
      },
    },
    required: ['_id', 'first name', 'phone number'],
  },
};
