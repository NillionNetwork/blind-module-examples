"""NilDB API integration for credential management."""
import requests
import json
from typing import Dict, List, Optional

class NilDBAPI:
    def __init__(self, node_config: Dict):
        self.nodes = node_config
    
    def create_credential(self, node_name: str, credential_data: Dict) -> bool:
        """Create a credential entry in the specified node."""
        try:
            node = self.nodes[node_name]
            headers = {
                'Authorization': f'Bearer {node["jwt"]}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                "schema": credential_data["schema"],
                "data": [credential_data["data"]]
            }
            
            response = requests.post(
                f"{node['url']}/data/create",
                headers=headers,
                json=payload
            )
            
            return response.status_code == 200
        except Exception as e:
            print(f"Error creating credential in {node_name}: {str(e)}")
            return False

    def read_credentials(self, node_name: str, schema: str, service: Optional[str] = None) -> List[Dict]:
        """Read credentials from the specified node."""
        try:
            node = self.nodes[node_name]
            headers = {
                'Authorization': f'Bearer {node["jwt"]}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                "schema": schema,
                "filter": {"service": service} if service else {}
            }
            
            response = requests.post(
                f"{node['url']}/data/read",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                return response.json().get("data", [])
            return []
        except Exception as e:
            print(f"Error reading credentials from {node_name}: {str(e)}")
            return []
