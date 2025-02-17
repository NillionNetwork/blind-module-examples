# Use these constants for the Nillion SecretSigner tECDSA program
# https://github.com/NillionNetwork/nilvm/blob/main/node/builtin-programs/tecdsa_sign.py

# Program ID
TECDSA_PROGRAM_ID = "builtin/tecdsa_sign"

# Input names
TECDSA_KEY_NAME = "tecdsa_private_key"
TECDSA_DIGEST_NAME = "tecdsa_digest_message"
TECDSA_SIGNATURE_NAME = "tecdsa_signature"

# Party names
TECDSA_KEY_PARTY = "tecdsa_key_party"
TECDSA_DIGEST_PARTY = "tecdsa_digest_message_party"
TECDSA_OUTPUT_PARTY = "tecdsa_output_party"