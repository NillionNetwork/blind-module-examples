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
                f"{node['url']}/data/create",
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
                f"{node['url']}/data/read",
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
                f"{node['url']}/queries/execute",
                headers=headers,
                json=payload
            )

            if response.status_code == 200:
                return response.json().get("data", [])
            return []
        except Exception as e:
            print(f"Error executing query on {node_name}: {str(e)}")
            return []

    def create_schema(node_urls: list = None, node_jwts: list = None, payload: dict = None) -> None:
        """Create a schema in the specified nodes."""
        for i, (url, jwt) in enumerate(zip(node_urls, node_jwts)):
            try:
                headers = {
                    'Authorization': f'Bearer {jwt}',
                    'Content-Type': 'application/json'
                }

                response = requests.post(
                    f"{url}/schemas",
                    headers=headers,
                    json=payload if payload is not None else {}
                )

                if response.status_code == 200:
                    print(f"Schema created successfully in {url}.")
                else:
                    print(f"Failed to create schema in {url}: {response.status_code} {response.text}")

            except Exception as e:
                print(f"Error creating schema in {url}: {str(e)}")

    def create_query(node_urls: list = None, node_jwts: list = None, payload: dict = {}) -> None:
        """Create a query in the specified nodes."""
        for i, (url, jwt) in enumerate(zip(node_urls, node_jwts)):
            try:
                headers = {
                    'Authorization': f'Bearer {jwt}',
                    'Content-Type': 'application/json'
                }

                response = requests.post(
                    f"{url}/queries",
                    headers=headers,
                    json=payload if payload is not None else {}
                )

                if response.status_code == 200:
                    print(f"Query created successfully in {url}.")
                else:
                    print(f"Failed to create query in {url}: {response.status_code} {response.text}")

            except Exception as e:
                print(f"Error creating query in {url}: {str(e)}")
