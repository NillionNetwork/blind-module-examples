from config import NODE_CONFIG, SCHEMA_ID, ORG_DID
from nildb_api import NilDBAPI

# Initialize services
nildb_api = NilDBAPI(NODE_CONFIG)

def define_collection(schema: dict) -> bool:
    """Define a collection and register it on the nodes."""
    try:
        # Create schema across nodes
        success = True
        for i, node_name in enumerate(['node_a', 'node_b', 'node_c']):
            payload = {
                "_id": SCHEMA_ID,
                "owner": ORG_DID,
                "name": "My Data",
                "keys": [
                    "_id"
                  ],
                "schema": schema,
            }
            if not nildb_api.create_schema(node_name, payload):
                success = False
                break

        return success
    except Exception as e:
        print(f"Error creating schema: {str(e)}")
        return False

if __name__ == "__main__":
    # define the schema
    credentials_schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "_id": {
                    "type": "string",
                    "format": "uuid",
                    "coerce": True
                },
                "username": {
                    "type": "string"
                },
                "password": {
                    "type": "string"
                },
                "service": {
                    "type": "string"
                }
            },
            "required": [
                "_id",
                "username",
                "password",
                "service"
            ],
            "additionalProperties": False
        }
    }

    # register on nodes
    define_collection(credentials_schema)