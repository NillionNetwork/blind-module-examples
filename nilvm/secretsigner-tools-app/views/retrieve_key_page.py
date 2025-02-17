import streamlit as st
import asyncio
from src.nillion_utils import retrieve_ecdsa_key

def show():
    st.text("""
        Retrieve your ECDSA private key from Nillion. You'll need the Store ID and a user key seed with permission to retrieve the key.
    """)
    
    store_id = st.text_input(
        "Store ID",
        help="The UUID where your key is stored in Nillion"
    )
    
    user_key_seed = st.text_input(
        "Password (User Key Seed)",
        type="password",
        help="The seed used to generate your user key when storing the key"
    )
    
    if st.button("Retrieve Key"):
        if not store_id:
            st.error("Store ID is required")
            return
            
        if not user_key_seed:
            st.error("User Key Seed is required")
            return
            
        try:
            with st.spinner('Retrieving key from Nillion...'):
                # Retrieve the key
                retrieved_keys = asyncio.run(retrieve_ecdsa_key(
                    store_id,
                    user_key_seed=user_key_seed
                ))
                
                # Show success message
                st.success("✅ Key retrieved successfully!")

                st.subheader("Private Key")
                st.text_input(
                    "Private Key",
                    help="64 characters hexadecimal, with or without '0x' prefix",
                    type="password",
                    value=f"0x{retrieved_keys['private_key']}"
                )

                st.header("Retrieved Key Details")
                st.subheader("Public Key")
                st.code(f"0x{retrieved_keys['public_key']}")
                
                st.subheader("Ethereum Address")
                st.code(retrieved_keys['ethereum_address'])
                
                # Show security reminder
                st.warning("""
                    🔐 **Security Reminder:**
                    Make sure to securely store or use your private key.
                    Clear your clipboard and browser history after copying sensitive data.
                """)
                
        except Exception as e:
            st.error(f"Error retrieving key: {str(e)}") 