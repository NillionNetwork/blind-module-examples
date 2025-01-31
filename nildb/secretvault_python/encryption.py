"""Encryption utilities using nilql for secret sharing."""
import nilql
from typing import List

class DataEncryption:
    def __init__(self, num_nodes: int):
        self.num_nodes = num_nodes
        self.secret_key = nilql.ClusterKey.generate({'nodes': [{}] * num_nodes},{'store': True})

    def encrypt_password(self, password: str) -> List[str]:
        """Encrypt password using secret sharing."""
        try:
            encrypted_shares = nilql.encrypt(self.secret_key, password)

            return list(encrypted_shares)
        except Exception as e:
            raise Exception(f"Encryption failed: {str(e)}")

    def decrypt_password(self, encoded_shares: List[str]) -> str:
        """Decrypt password from shares."""
        try:
            decoded_shares = []
            for share in encoded_shares:
                decoded_shares.append(share)
                
            return str(nilql.decrypt(self.secret_key, decoded_shares))
        except Exception as e:
            raise Exception(f"Decryption failed: {str(e)}")
