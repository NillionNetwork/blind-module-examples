from nillion_client import (
    InputPartyBinding,
    Network,
    NilChainPayer,
    NilChainPrivateKey,
    OutputPartyBinding,
    VmClient,
    PrivateKey,
    EcdsaDigestMessage
)
from nillion_client.ids import UUID
import asyncio
import hashlib
from nillion_config import config
from nillion_signature_constants import TECDSA_DIGEST_NAME, TECDSA_DIGEST_PARTY, TECDSA_KEY_PARTY, TECDSA_OUTPUT_PARTY, TECDSA_PROGRAM_ID
from helpers import verify_signature

# REPLACE THIS WITH YOUR STORE ID
store_id = "af9baa72-ad9f-41d1-879d-df287a6ea11e"
message_to_sign = "Hello, world!"
public_key_for_verification = "0463c7b5356003fd4b188634721487d96c5af82b5038bf884e0da9640bf8206130607c1d0a30432d57793d466e25276bc75dc52a55b26e77486f2dd00e64760bc3"

async def signWithStoredPrivateKey(store_id_to_sign_with: str, message_to_sign: str, public_key: str):
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

    if isinstance(store_id_to_sign_with, str):
        store_id = UUID(store_id_to_sign_with)
   
    message_hashed = hashlib.sha256(message_to_sign.encode()).digest()

    # Set up the signing computation
    input_bindings = [
        InputPartyBinding(TECDSA_KEY_PARTY, client.user_id),
        InputPartyBinding(TECDSA_DIGEST_PARTY, client.user_id)
    ]
    output_bindings = [OutputPartyBinding(TECDSA_OUTPUT_PARTY, [client.user_id])]

    # Execute the signing computation
    compute_id = await client.compute(
        TECDSA_PROGRAM_ID,
        input_bindings,
        output_bindings,
        values={TECDSA_DIGEST_NAME: EcdsaDigestMessage(bytearray(message_hashed))},
        value_ids=[store_id],
    ).invoke()

    # Get the signature
    tecdsa_result = await client.retrieve_compute_results(compute_id).invoke()
    signature = tecdsa_result["tecdsa_signature"]
    
    # Convert signature to standard format
    (r, s) = signature.value
    signature_dict = {
        'r': hex(int.from_bytes(r, byteorder="big"))[2:],  # Remove '0x' prefix
        's': hex(int.from_bytes(s, byteorder="big"))[2:]   # Remove '0x' prefix
    }
    print(f"Signature: {signature_dict}")
    
    # Verify the signature
    verification_result = verify_signature(message_to_sign, signature_dict, public_key_for_verification)
    print(f"Signature verification result: {verification_result}")


if __name__ == "__main__":
    asyncio.run(signWithStoredPrivateKey(store_id, message_to_sign, public_key_for_verification))