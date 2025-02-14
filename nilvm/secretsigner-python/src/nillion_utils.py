from nillion_client import (
    Network,
    NilChainPayer,
    NilChainPrivateKey,
    Permissions,
    EcdsaPrivateKey,
    VmClient,
    PrivateKey,
    UserId,
    InputPartyBinding,
    OutputPartyBinding,
    EcdsaDigestMessage,
    EcdsaSignature
)
from nillion_client.ids import UUID
from dotenv import load_dotenv
import os
import hashlib
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, utils
from src.utils import derive_eth_address, derive_public_key_from_private
import streamlit as st
from siwe import SiweMessage
from datetime import datetime
import time
from pydantic import BaseModel
from typing import Optional, List
from web3 import Web3

# Nillion ECDSA Configuration
builtin_tecdsa_program_id = "builtin/tecdsa_sign"
builtin_tecdsa_private_key_name = "tecdsa_private_key"
tecdsa_digest_name = "tecdsa_digest_message"
tecdsa_signature_name = "tecdsa_signature"
tecdsa_key_party = "tecdsa_key_party"
tecdsa_digest_party = "tecdsa_digest_message_party"
tecdsa_output_party = "tecdsa_output_party"

class SimpleMessageParams(BaseModel):
    """Parameters for creating a simple signed message"""
    message: str

class SiweMessageParams(BaseModel):
    """Parameters for creating a Sign-In with Ethereum message"""
    domain: str
    ethereum_address: str
    uri: Optional[str] = None
    version: str = "1"
    chain_id: int = 1
    nonce: Optional[str] = None
    issued_at: Optional[str] = None
    expiration_time: Optional[str] = None
    not_before: Optional[str] = None
    request_id: Optional[str] = None
    resources: Optional[List[str]] = None
    statement: Optional[str] = None

class TxMessageParams(BaseModel):
    """Parameters for signing a transaction hash"""
    tx_hash: bytes  # The transaction hash to sign as raw bytes
    message: bytes  # The original message as raw bytes

def get_nillion_network():
    """
    Get or create a singleton Nillion network instance.
    Returns tuple of (Network, Payer)
    """
    # Check if network already exists in session state
    if 'nillion_network' not in st.session_state:
        home = os.getenv("HOME")
        load_dotenv(f"{home}/.config/nillion/nillion-devnet.env")
        
        # Check for Nillion network configuration in streamlit secrets
        if st.secrets.get("nillion_chain_id") and st.secrets.get("nillion_nilvm_bootnode") and st.secrets.get("nillion_nilchain_grpc"):
            # Use Nillion network testnet configuration from secrets
            network = Network(
                chain_id=st.secrets["nillion_chain_id"],
                nilvm_grpc_endpoint=st.secrets["nillion_nilvm_bootnode"],
                chain_grpc_endpoint=st.secrets["nillion_nilchain_grpc"]
            )
        else:
            # Fall back to local Nillion devnet configuration (nillion-devnet)
            network = Network.from_config("devnet")
        
        # Get payment key from secrets or nillion-devnet environment
        nilchain_key = st.secrets.get("nilchain_key") or os.getenv("NILLION_NILCHAIN_PRIVATE_KEY_0")
        if not nilchain_key:
            raise ValueError("No Nilchain private key for NIL payments found in secrets or environment")
            
        payer = NilChainPayer(
            network,
            wallet_private_key=NilChainPrivateKey(bytes.fromhex(nilchain_key)),
            gas_limit=10000000,
        )

        # Store both network and payer in session state
        st.session_state.nillion_network = network
        st.session_state.nillion_payer = payer
    
    return st.session_state.nillion_network, st.session_state.nillion_payer

def user_key_from_seed(seed: str) -> PrivateKey:
    """Generate a user key from a given seed using SHA-256."""
    key_bytes = hashlib.sha256(seed.encode()).digest()
    return PrivateKey(key_bytes)

async def store_ecdsa_key(ecdsa_private_key: str, ttl_days: int = 5, user_key_seed: str = "demo", compute_permissioned_user_ids: list[str] = None, retrieve_permissioned_user_ids: list[str] = None):
    """Store an ECDSA private key in Nillion's secure storage"""
    network, payer = get_nillion_network()
    user_key = user_key_from_seed(user_key_seed)
    client = await VmClient.create(user_key, network, payer)
    funds_amount = 10000000
    print(f"💰  Adding some funds to the client balance: {funds_amount} uNIL")
    await client.add_funds(funds_amount)

    # Convert private key to bytes
    private_bytes = bytearray(bytes.fromhex(ecdsa_private_key))
    
    # Derive public key
    public_key_hex = derive_public_key_from_private(ecdsa_private_key)

    # Derive Ethereum address
    ethereum_address = derive_eth_address(public_key_hex)

    # Only store the private key in Nillion
    secret_key = {
        builtin_tecdsa_private_key_name: EcdsaPrivateKey(private_bytes)
    }

    # Set permissions for the stored key
    permissions = Permissions.defaults_for_user(client.user_id).allow_compute(
        client.user_id, builtin_tecdsa_program_id
    )
    
    # Add allowed user IDs for compute permissions
    if compute_permissioned_user_ids:
        for user_id in compute_permissioned_user_ids:
            permissions.allow_compute(UserId.parse(user_id), builtin_tecdsa_program_id)
    
    # Add allowed user IDs for retrieve permissions
    if retrieve_permissioned_user_ids:
        for user_id in retrieve_permissioned_user_ids:
            permissions.allow_retrieve(UserId.parse(user_id))

    # Store the key
    store_id = await client.store_values(
        secret_key,
        ttl_days=ttl_days, 
        permissions=permissions
    ).invoke()

    return {
        'store_id': store_id,
        'public_key': f"0x{public_key_hex}",
        'ethereum_address': ethereum_address,
        'ttl_days': ttl_days,
        'program_id': builtin_tecdsa_program_id,
        'default_permissioned_user_id': str(client.user_id),
        'compute_permissioned_user_ids': compute_permissioned_user_ids,
        'retrieve_permissioned_user_ids': retrieve_permissioned_user_ids
    }

async def retrieve_ecdsa_key(store_id: str | UUID, secret_name: str = builtin_tecdsa_private_key_name, user_key_seed: str = "demo"):
    """Retrieve a secret value from Nillion's secure storage"""
    network, payer = get_nillion_network()
    user_key = user_key_from_seed(user_key_seed)
    client = await VmClient.create(user_key, network, payer)
    funds_amount = 10000000
    print(f"💰  Adding some funds to the client balance: {funds_amount} uNIL")
    await client.add_funds(funds_amount)

    if isinstance(store_id, str):
        store_id = UUID(store_id)
    
    # Retrieve the private key
    retrieved_values = await client.retrieve_values(store_id).invoke()
    ecdsa_private_key_obj = retrieved_values[secret_name]
    private_key_bytes = ecdsa_private_key_obj.value
    private_key_hex = private_key_bytes.hex()
    
    # Derive public key
    public_key_hex = derive_public_key_from_private(private_key_hex)

    # Derive Ethereum address
    ethereum_address = derive_eth_address(public_key_hex)
    
    return {
        'private_key': private_key_hex,
        'public_key': public_key_hex,
        'ethereum_address': ethereum_address
    }

async def get_user_id_from_seed(user_key_seed: str = "demo") -> str:
    """Get the Nillion user ID for a given seed"""
    network, payer = get_nillion_network()
    user_key = user_key_from_seed(user_key_seed)
    client = await VmClient.create(user_key, network, payer)
    funds_amount = 10000000
    print(f"💰  Adding some funds to the client balance: {funds_amount} uNIL")
    await client.add_funds(funds_amount)
    return str(client.user_id)

async def sign_message(
    store_id_private_key: str | UUID,
    message_params: SimpleMessageParams | SiweMessageParams | TxMessageParams,
    user_key_seed: str
) -> dict:
    """
    Signs a message using a private key stored in Nillion. Can create and sign either a simple message
    or a structured SIWE (Sign-In with Ethereum) message.
    """
    network, payer = get_nillion_network()
    user_key = user_key_from_seed(user_key_seed)
    client = await VmClient.create(user_key, network, payer)
    funds_amount = 10000000
    print(f"💰  Adding some funds to the client balance: {funds_amount} uNIL")
    await client.add_funds(funds_amount)

    if isinstance(store_id_private_key, str):
        store_id_private_key = UUID(store_id_private_key)

    if isinstance(message_params, SimpleMessageParams):
        final_message = message_params.message
        message_hashed = hashlib.sha256(final_message.encode()).digest()
    elif isinstance(message_params, TxMessageParams):
        final_message = message_params.message
        message_hashed = message_params.tx_hash
    else:
        # Create SIWE message
        siwe_message = SiweMessage(
            domain=message_params.domain,
            address=message_params.ethereum_address,
            uri=message_params.uri or f"https://{message_params.domain}",
            version=message_params.version,
            chain_id=message_params.chain_id,
            nonce=message_params.nonce or hex(int(time.time() * 1000))[2:],
            issued_at=message_params.issued_at or datetime.utcnow().isoformat(),
            expiration_time=message_params.expiration_time,
            not_before=message_params.not_before,
            request_id=message_params.request_id,
            resources=message_params.resources,
            statement=message_params.statement
        )
        final_message = siwe_message.prepare_message()
        message_hashed = hashlib.sha256(final_message.encode()).digest()
    
    # Store the message in Nillion
    nillion_message_value = {
        tecdsa_digest_name: EcdsaDigestMessage(bytearray(message_hashed)),
    }
    
    # Set permissions
    permissions = Permissions.defaults_for_user(client.user_id).allow_compute(
        client.user_id, builtin_tecdsa_program_id
    )
    
    # Store the message
    store_id_message_to_sign = await client.store_values(
        nillion_message_value, 
        ttl_days=1,
        permissions=permissions
    ).invoke()

    # Set up the signing computation
    input_bindings = [
        InputPartyBinding(tecdsa_key_party, client.user_id),
        InputPartyBinding(tecdsa_digest_party, client.user_id)
    ]
    output_bindings = [OutputPartyBinding(tecdsa_output_party, [client.user_id])]

    # Execute the signing computation
    compute_id = await client.compute(
        builtin_tecdsa_program_id,
        input_bindings,
        output_bindings,
        values={},
        value_ids=[store_id_private_key, store_id_message_to_sign],
    ).invoke()

    # Get the signature
    result = await client.retrieve_compute_results(compute_id).invoke()
    signature: EcdsaSignature = result["tecdsa_signature"]
    
    # Convert signature to standard format
    (r, s) = signature.value
    
    return {
        'signature': {
            'r': hex(int.from_bytes(r, byteorder="big")),
            's': hex(int.from_bytes(s, byteorder="big"))
        },
        'message': final_message,
        'message_hash': message_hashed.hex()
    }

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

async def sign_transaction(
    tx_params: dict,
    store_id_private_key: str,
    user_key_seed: str
) -> dict:
    """Signs an Ethereum transaction using Nillion's secure signing"""
    # Create Web3 instance
    w3 = Web3()
    
    # Create the unsigned transaction hash using Web3's encoding
    unsigned_tx = w3.eth.account._prepare_transaction(tx_params)
    tx_hash = w3.keccak(unsigned_tx.encode())
    
    signed = await sign_message(
        store_id_private_key=store_id_private_key,
        message_params=SimpleMessageParams(message=tx_hash.hex()),
        user_key_seed=user_key_seed
    )
    
    # Create SignedTransaction using the signature components
    r = int(signed['signature']['r'], 16)
    s = int(signed['signature']['s'], 16)
    v = 27  # Default v value for eth_sign
    
    # Encode the transaction with the signature
    encoded_tx = w3.eth.account._encode_transaction(unsigned_tx, v, r, s)
    
    return {
        'rawTransaction': Web3.to_hex(encoded_tx),
        'hash': tx_hash.hex(),
        'r': hex(r),
        's': hex(s),
        'v': v
    }