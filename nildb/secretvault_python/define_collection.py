import json

from config import NODE_CONFIG, SCHEMA_ID
import generate_tokens
from nildb_api import NilDBAPI

# Initialize services
nildb_api = NilDBAPI(NODE_CONFIG)

def define_collection(schema: dict) -> bool:
    """Define a collection and register it on the nodes."""
    try:
        # Create schema across nodes
        success = True
        for i, node_name in enumerate(NODE_CONFIG.keys()):
            payload = {
                "_id": SCHEMA_ID,
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
    # generate short-lived JTWs
    generate_tokens.update_config()
    # register on nodes
    define_collection(json.load(open('schema.json', 'r')))