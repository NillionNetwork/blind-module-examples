from nillion_client import (
    Network,
    NilChainPayer,
    NilChainPrivateKey,
    VmClient,
    PrivateKey,
)
from nillion_client.ids import UUID
import asyncio
import hashlib
from nillion_config import config
from nillion_signature_constants import TECDSA_KEY_NAME
from helpers import derive_public_key_from_private

# REPLACE THIS WITH YOUR STORE ID
store_id = "af9baa72-ad9f-41d1-879d-df287a6ea11e"

async def retrievePrivateKey(store_id_to_retrieve: str):
    print(f"Connected to Nillion {config.NILLION_NETWORK_CONFIG}")
    network = Network(
      chain_id=config.NILLION_NILCHAIN_CHAIN_ID,
      chain_grpc_endpoint=config.NILLION_NILCHAIN_GRPC,
      nilvm_grpc_endpoint=config.NILLION_NILVM_GRPC_ENDPOINT,
    )

    # Create nilChain payer to pay for operations
    nilchain_key: str = config.NILLION_NILCHAIN_PRIVATE_KEY
    payer = NilChainPayer(
        network,
        wallet_private_key=NilChainPrivateKey(bytes.fromhex(nilchain_key)),
        gas_limit=10000000,
    )

    # Create a Nillion Client with a user key
    user_key = PrivateKey(hashlib.sha256(config.NILLION_USER_KEY_SEED.encode()).digest())
    client = await VmClient.create(user_key, network, payer)

    # Fund client with UNIL
    unil_amount_to_add = 10000000
    await client.add_funds(unil_amount_to_add)

    if isinstance(store_id_to_retrieve, str):
        store_id = UUID(store_id_to_retrieve)
    
    # Retrieve the private key
    retrieved_values = await client.retrieve_values(store_id).invoke()
    ecdsa_private_key_obj = retrieved_values[TECDSA_KEY_NAME]
    private_key_bytes = ecdsa_private_key_obj.value
    private_key_hex = private_key_bytes.hex()
    
    # Derive public key
    public_key_hex = derive_public_key_from_private(private_key_hex)
    print(f"Retrieved private key: {private_key_hex}")
    print(f"Retrieved public key: {public_key_hex}")

if __name__ == "__main__":
    asyncio.run(retrievePrivateKey(store_id))