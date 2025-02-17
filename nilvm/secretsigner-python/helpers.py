from cryptography.hazmat.primitives.asymmetric import ec, utils
from cryptography.hazmat.primitives import hashes, serialization

def clean_hex_input(hex_str: str) -> str:
    """Clean hex input by removing '0x' prefix and whitespace"""
    return hex_str.replace('0x', '').replace(' ', '').strip().lower()

def derive_public_key_from_private(private_key_hex: str) -> str:
    """Derive uncompressed public key from private key hex string
    
    Args:
        private_key_hex (str): Private key in hex format (with or without 0x prefix)
        
    Returns:
        str: Uncompressed public key in hex format (with 04 prefix)
    """
    # Clean input and convert to bytes
    private_key_clean = clean_hex_input(private_key_hex)
    private_bytes = bytearray(bytes.fromhex(private_key_clean))
    
    # Generate private key object and derive public key
    private_key = ec.derive_private_key(
        int.from_bytes(private_bytes, byteorder='big'), 
        ec.SECP256K1()
    )
    public_key = private_key.public_key()
    
    # Get public key coordinates
    public_numbers = public_key.public_numbers()
    x_hex = format(public_numbers.x, '064x')
    y_hex = format(public_numbers.y, '064x')
    
    # Return uncompressed public key format
    return f"04{x_hex}{y_hex}"

async def generate_ecdsa_key_pair(private_key_hex: str = None, print_private_key: bool = False):
    # Generate ECDSA private key to store in the Nillion Network
    if private_key_hex is None:
        ecdsa_private_key = ec.generate_private_key(ec.SECP256K1())
    else:
        ecdsa_private_key = ec.derive_private_key(
            int.from_bytes(bytes.fromhex(private_key_hex), byteorder='big'), 
            ec.SECP256K1()
        )
    
    # Convert private key to bytes
    private_key_bytes = ecdsa_private_key.private_numbers().private_value.to_bytes(
        length=ecdsa_private_key.key_size // 8,  # Key size in bytes
        byteorder='big'
    )

    if print_private_key:
        print("ECDSA Key Pair:")
        print(f"🤫 Private key: {private_key_bytes.hex()}")
        print(f"👀 Public key: {derive_public_key_from_private(private_key_bytes.hex())}")
    
    # Derive public key from private key
    public_key = derive_public_key_from_private(private_key_bytes.hex())

    return private_key_bytes, public_key


def verify_signature(message_or_hash: str | bytes, signature: dict, public_key: str, is_hash: bool = False) -> dict:
    """Verify an ECDSA signature using a public key"""
    try:
        # Handle message/hash input
        if is_hash:
            if isinstance(message_or_hash, str):
                message_bytes = bytes.fromhex(message_or_hash.replace('0x', ''))
            else:
                message_bytes = message_or_hash
            message = None
            original_message = None
        else:
            if isinstance(message_or_hash, str):
                original_message = message_or_hash
                message_bytes = message_or_hash.encode('utf-8')
            else:
                original_message = message_or_hash.decode()
                message_bytes = message_or_hash
            
            # Create hash of the message
            digest = hashes.Hash(hashes.SHA256())
            digest.update(message_bytes)
            message_bytes = digest.finalize()
        
        # Convert signature components to integers and encode
        try:
            r = int(signature['r'], 16)
            s = int(signature['s'], 16)
            encoded_signature = utils.encode_dss_signature(r, s)
        except Exception as e:
            return {
                'verified': False,
                'error': f"Failed to parse signature: {str(e)}",
                'debug': {
                    'r': signature.get('r'),
                    's': signature.get('s')
                }
            }
        
        # Convert public key to cryptography format
        try:
            public_key = public_key.replace('0x', '')
            x = int(public_key[2:66], 16)  # Skip '04' prefix and take 64 chars for x
            y = int(public_key[66:], 16)   # Take remaining 64 chars for y
            public_numbers = ec.EllipticCurvePublicNumbers(x, y, ec.SECP256K1())
            ecdsa_public_key = public_numbers.public_key()
        except Exception as e:
            return {
                'verified': False,
                'error': f"Failed to parse public key: {str(e)}",
                'debug': {
                    'public_key': public_key,
                    'length': len(public_key)
                }
            }
        
        # Convert public key to PEM format for display
        pem_public_key = ecdsa_public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        # Verify the signature using the library's verify method
        try:
            # Always use Prehashed since we're always working with the hash
            ecdsa_public_key.verify(
                encoded_signature,
                message_bytes,
                ec.ECDSA(utils.Prehashed(hashes.SHA256()))
            )
            verified = True
        except Exception as e:
            return {
                'verified': False,
                'error': f"Signature verification failed: {str(e)}",
                'debug': {
                    'message': message_bytes.hex(),
                    'signature': {
                        'r': hex(r),
                        's': hex(s),
                        'encoded': encoded_signature.hex() if hasattr(encoded_signature, 'hex') else str(encoded_signature)
                    },
                    'public_key': {
                        'raw': public_key,
                        'x': hex(x),
                        'y': hex(y),
                        'pem': pem_public_key.decode()
                    }
                }
            }
        
        result = {
            'verified': True,
            'message': message_bytes.hex(),  # Always show the hash
            'signature': {
                'r': hex(r),
                's': hex(s)
            },
            'public_key': {
                'hex': f"0x{public_key}",
                'pem': pem_public_key.decode()
            }
        }
        
        # Add original message if available
        if original_message is not None:
            result['original_message'] = original_message
            
        return result
        
    except Exception as e:
        return {
            'verified': False,
            'error': f"Unexpected error: {str(e)}"
        }