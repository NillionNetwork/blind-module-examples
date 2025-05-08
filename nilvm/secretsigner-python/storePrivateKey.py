from nillion_client import (
    Network,
    NilChainPayer,
    NilChainPrivateKey,
    Permissions,
    EcdsaPrivateKey,
    VmClient,
    PrivateKey,
)
import asyncio
import hashlib
from nillion_config import config
from nillion_signature_constants import TECDSA_PROGRAM_ID, TECDSA_KEY_NAME
from helpers import generate_ecdsa_key_pair

# If you want to store a private key that you already have, you can pass it in as a hex string
# Otherwise, a new key will be generated
async def storePrivateKey(private_key_hex = None):
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

    # Generate an ECDSA key pair to store in Nillion
    private_key_bytes, public_key = await generate_ecdsa_key_pair()

    ##### STORE ECDSA PRIVATE KEY
    # ecdsa key to be stored or used for signing
    private_key_to_store = {
        TECDSA_KEY_NAME: EcdsaPrivateKey(bytearray(private_key_bytes)),
    }

    # Create a permissions object to attach to the stored secret
    # This gives the user the ability to use the private key to sign messages
    permissions = Permissions.defaults_for_user(client.user_id).allow_compute(
        client.user_id, TECDSA_PROGRAM_ID
    )

    # Store the private key in Nillion
    store_id = await client.store_values(
        private_key_to_store, ttl_days=60, permissions=permissions
    ).invoke()

    print(f"Private Key Store ID: {store_id}")
    print(f"The public key that corresponds to the stored private key is: {public_key}")

if __name__ == "__main__":
    asyncio.run(storePrivateKey())