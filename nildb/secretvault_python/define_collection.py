import json
import uuid
import toml

from config import NODE_CONFIG
import generate_tokens
from nildb_api import NilDBAPI

# Initialize services
nildb_api = NilDBAPI(NODE_CONFIG)

def define_collection(schema: dict) -> str:
    """Define a collection and register it on the nodes."""
    try:
        # Generate and id for the schema
        schema_id = str(uuid.uuid4())

        # Create schema across nodes
        success = True
        for i, node_name in enumerate(NODE_CONFIG.keys()):
            payload = {
                "_id": schema_id,
                "name": "My Data",
                "keys": [
                    "_id"
                  ],
                "schema": schema,
            }
            if not nildb_api.create_schema(node_name, payload):
                success = False
                break

        # Store the schema_id
        update_config(schema_id, "schema_id")
        return schema_id
    except Exception as e:
        print(f"Error creating schema: {str(e)}")
        return ""

def define_query(schema_id: str) -> bool:
    """Define a query and register it on the nodes."""
    try:
        # Generate and id for the schema
        query_id = str(uuid.uuid4())

        # Create schema across nodes
        success = True
        for i, node_name in enumerate(NODE_CONFIG.keys()):
            payload = {
                "_id": query_id,
                "name": "My Query",
                "schema": schema_id,
                "variables": {},
                "pipeline": [
                        {
                        "$project": {
                            "passwordFields": { "$objectToArray": "$password" }
                        }
                        },
                        {
                        "$unwind": "$passwordFields"
                        },
                        {
                        "$match": { "passwordFields.k": "$share" }
                        },
                        {
                        "$group": {
                            "_id": None,
                            "total_password_share": { "$sum": "$passwordFields.v" }
                        }
                        },
                        {
                        "$project": {
                            "_id": 0,
                            "result": {
                            "$mod": [
                                "$total_password_share",
                                { "$add": [{ "$pow": [2, 32] }, 15] }
                            ]
                            }
                        }
                        }
                    ],
            }
            if not nildb_api.create_query(node_name, payload):
                success = False
                break

        # Store the schema_id
        update_config(query_id, "query_id")
        return success
    except Exception as e:
        print(f"Error creating schema: {str(e)}")
        return False

def update_config(id: str, secret: str) -> None:
    """Updates the 'schema_id' key in the secrets TOML file."""
    # Define the path to the secrets file
    secrets_file = ".streamlit/secrets.toml"

    # Load existing secrets file
    try:
        with open(secrets_file, "r") as file:
            secrets = toml.load(file)
    except (FileNotFoundError, toml.TomlDecodeError):
        print(f"Malformed or missing secrets file: {secrets_file}")

    # Update the schema_id only
    secrets[f"{secret}"] = id

    # Write back to the file, preserving all other values
    with open(secrets_file, "w") as file:
        toml.dump(secrets, file)


if __name__ == "__main__":
    # generate short-lived JTWs
    generate_tokens.update_config()
    # register on nodes
    schema_id = define_collection(json.load(open('schema.json', 'r')))
    define_query(schema_id)