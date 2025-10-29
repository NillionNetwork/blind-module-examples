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
            name: {
                type: 'string',
            },
            age: {
                type: 'number',
            },
            phone_number: {
                type: 'object',
                properties: {
                    '%share': {
                        type: 'string',
                    },
                },
                required: ['%share'],
            },
            country_code: {
                type: 'object',
                properties: {
                    '%share': {
                        type: 'string',
                    },
                },
                required: ['%share'],
            },
        },
        required: ['_id', 'name', 'phone_number'],
    },
};
