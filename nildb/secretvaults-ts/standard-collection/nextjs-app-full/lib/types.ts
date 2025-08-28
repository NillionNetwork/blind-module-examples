export interface ApiKeyRecord extends Record<string, unknown> {
  _id: string;
  service: string;
  username: string;
  apiKey: {
    '%allot': string;
  };
}

export interface CollectionSchema {
  _id: string;
  type: 'standard';
  name: string;
  schema: {
    type: 'array';
    items: {
      type: 'object';
      properties: {
        _id: { type: 'string' };
        service: { type: 'string' };
        username: { type: 'string' };
        apiKey: {
          type: 'object';
          properties: {
            '%share': { type: 'string' };
          };
          required: ['%share'];
        };
      };
      required: ['_id', 'service', 'username', 'apiKey'];
    };
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}