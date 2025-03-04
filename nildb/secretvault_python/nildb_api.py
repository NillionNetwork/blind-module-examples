"""NilDB API integration"""
import requests
from typing import Dict, List, Optional

class NilDBAPI:
    def __init__(self, node_config: Dict):
        self.nodes = node_config
    
    def data_upload(self, node_name: str, schema_id: str, payload: list) -> bool:
        """Create/upload records in the specified node and schema."""
        try:
            node = self.nodes[node_name]
            headers = {
                'Authorization': f'Bearer {node["jwt"]}',
                'Content-Type': 'application/json'
            }
            
            body = {
                "schema": schema_id,
                "data": payload
            }

            response = requests.post(
                f"{node['url']}/api/v1/data/create",
                headers=headers,
                json=body
            )
            
            return response.status_code == 200 and response.json().get("data", {}).get("errors", []) == []
        except Exception as e:
            print(f"Error creating records in {node_name}: {str(e)}")
            return False

    def data_read(self, node_name: str, schema_id: str, filter_dict: Optional[dict] = None) -> List[Dict]:
        """Read data from the specified node and schema."""
        try:
            node = self.nodes[node_name]
            headers = {
                'Authorization': f'Bearer {node["jwt"]}',
                'Content-Type': 'application/json'
            }
            
            body = {
                "schema": schema_id,
                "filter": filter_dict if filter_dict is not None else {}
            }
            
            response = requests.post(
                f"{node['url']}/api/v1/data/read",
                headers=headers,
                json=body
            )
            
            if response.status_code == 200:
                return response.json().get("data", [])
            return []
        except Exception as e:
            print(f"Error reading data from {node_name}: {str(e)}")
            return []

    def query_execute(self, node_name: str, query_id: str, variables: Optional[dict] = None) -> List[Dict]:
        """Execute a query on the specified node with advanced filtering."""
        try:
            node = self.nodes[node_name]
            headers = {
                'Authorization': f'Bearer {node["jwt"]}',
                'Content-Type': 'application/json'
            }

            payload = {
                "id": query_id,
                "variables": variables if variables is not None else {}
            }

            response = requests.post(
                f"{node['url']}/api/v1/queries/execute",
                headers=headers,
                json=payload
            )

            if response.status_code == 200:
                return response.json().get("data", [])
            return []
        except Exception as e:
            print(f"Error executing query on {node_name}: {str(e)}")
            return []

    def create_schema(self, node_name: str, payload: dict = None) -> bool:
        """Create a schema in the specified node."""
        try:
            node = self.nodes[node_name]
            headers = {
                'Authorization': f'Bearer {node["jwt"]}',
                'Content-Type': 'application/json'
            }
            response = requests.post(
                f"{node['url']}/api/v1/schemas",
                headers=headers,
                json=payload if payload is not None else {}
            )

            if response.ok:
                print(f"Schema created successfully on {node_name}.")
                return True
            else:
                print(f"Failed to create schema on {node_name}: {response.status_code} {response.text}")
                return False

        except Exception as e:
            print(f"Error creating schema on {node_name}: {str(e)}")
            return False

    def create_query(self, node_name: str, payload: dict = {}) -> bool:
        """Create a query in the specified node."""
        try:
            node = self.nodes[node_name]
            headers = {
                'Authorization': f'Bearer {node["jwt"]}',
                'Content-Type': 'application/json'
            }

            response = requests.post(
                f"{node['url']}/api/v1/queries",
                headers=headers,
                json=payload if payload is not None else {}
            )

            if response.ok:
                print(f"Query created successfully on {node_name}.")
                return True
            else:
                print(f"Failed to create query in {node_name}: {response.status_code} {response.text}")
                return False

        except Exception as e:
            print(f"Error creating query in {node_name}: {str(e)}")
            return False
