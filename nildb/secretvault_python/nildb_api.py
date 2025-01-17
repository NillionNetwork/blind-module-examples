"""NilDB API integration"""
import requests
from typing import Dict, List, Optional

class NilDBAPI:
    def __init__(self, node_config: Dict):
        self.nodes = node_config
    
    def data_upload(self, node_name: str, schema: str, payload: list) -> bool:
        """Create/upload records in the specified node and schema."""
        try:
            node = self.nodes[node_name]
            headers = {
                'Authorization': f'Bearer {node["jwt"]}',
                'Content-Type': 'application/json'
            }
            
            body = {
                "schema": schema,
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

    def data_read(self, node_name: str, schema: str, filter_dict: Optional[dict] = None) -> List[Dict]:
        """Read data from the specified node and schema."""
        try:
            node = self.nodes[node_name]
            headers = {
                'Authorization': f'Bearer {node["jwt"]}',
                'Content-Type': 'application/json'
            }
            
            body = {
                "schema": schema,
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
