import jwt
import time
from ecdsa import SigningKey, SECP256k1
from config import NODE_CONFIG, ORG_DID, ORG_SECRET_KEY

def create_jwt(secret_key: str = None,
               org_did: str = None,
               node_ids: list = None,
               ttl: int = 3600) -> list:
    """
    Create JWTs signed with ES256K for multiple node_ids
    """
    
    # Convert the secret key from hex to bytes
    private_key = bytes.fromhex(secret_key)
    signer = SigningKey.from_string(private_key, curve=SECP256k1)

    tokens = []
    for node_id in node_ids:
        # Create payload for each node_id
        payload = {
            "iss": org_did,
            "aud": node_id,
            "exp": int(time.time()) + ttl
        }

        # Create and sign the JWT
        token = jwt.encode(
            payload,
            signer.to_pem(),
            algorithm="ES256K"
        )
        tokens.append(token)
        print(f"Generated JWT for {node_id}: {token}")
    
    return tokens

if __name__ == "__main__":
    secret_key = ORG_SECRET_KEY
    org_did = ORG_DID
    node_ids = [node['url'] for node in NODE_CONFIG.values()]
    create_jwt(secret_key, org_did, node_ids)