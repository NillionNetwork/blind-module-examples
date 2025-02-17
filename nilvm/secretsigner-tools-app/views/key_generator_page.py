import streamlit as st
from src.utils import generate_ecdsa_keypair, format_key_details

def show():
    st.header("Generate an ECDSA Key Pair Locally")
    
    st.text("""
        - The ECDSA private key is a secret number that allows you to sign transactions
        - The public key is derived from the private key and is used to verify signatures
        - The Ethereum address is a hashed version of the public key, used to receive funds
    """)
    
    st.warning("""
        🔒 **Security Note:**
        - Keys are generated locally in your browser - they never leave your device
        - Keep your private key secret - anyone with access can control your assets
        - For production use, generate keys in a secure, offline environment
    """)

    if st.button("Generate a new key pair locally"):
        keypair = generate_ecdsa_keypair()
        details = format_key_details(keypair)
        
        st.subheader("Private Key")
        st.text_input(
            "Private Key (hex)",
            help="64 characters hexadecimal, with or without '0x' prefix",
            type="password",
            value=details['private_key']['with_prefix']
        )

        st.subheader("Public Key")
        st.code(details['public_key']['with_prefix'])
        
        st.subheader("Ethereum Address")
        st.code(details['eth_address'])