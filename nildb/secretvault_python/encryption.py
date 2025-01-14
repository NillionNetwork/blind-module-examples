"""Encryption utilities using nilql for secret sharing."""
import base64
import nilql
from typing import List, Tuple, Dict

class CredentialEncryption:
    def __init__(self, num_nodes: int):
        self.num_nodes = num_nodes
        self.secret_key = nilql.SecretKey.generate({'nodes': [{}] * num_nodes},{'store': True})

    def encrypt_password(self, password: str) -> List[str]:
        """Encrypt password using secret sharing."""
        try:
            encrypted_shares = nilql.encrypt(self.secret_key, password)
            print('encrypted_shares', encrypted_shares)
            encoded_shares = []
            
            for i in range(self.num_nodes):
                encoded_shares.append(encrypted_shares[i])

            print('encoded_shares', encoded_shares)
            return encoded_shares
        except Exception as e:
            raise Exception(f"Encryption failed: {str(e)}")

    def decrypt_password(self, encoded_shares: List[str]) -> str:
        """Decrypt password from shares."""
        try:
            decoded_shares = []
            for share in encoded_shares:
                decoded_shares.append(share)
                
            return nilql.decrypt(self.secret_key, decoded_shares)
        except Exception as e:
            raise Exception(f"Decryption failed: {str(e)}")
