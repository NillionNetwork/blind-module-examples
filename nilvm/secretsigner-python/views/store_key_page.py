import streamlit as st
import asyncio
from src.nillion_utils import store_ecdsa_key
from src.utils import clean_hex_input

def validate_hex(hex_str: str) -> bool:
    """Validate if string is valid hex"""
    try:
        int(hex_str, 16)
        return True
    except ValueError:
        return False

def show():
    st.text("""
        Store your ECDSA private key in Nillion. The key will be split and stored across multiple nodes using secure multiparty computation.
    """)
    
    # Security warning
    st.warning("""
        🔒 **Security Note:**
        - Your key will be stored in Nillion. The key is split across multiple nodes and never reconstructed in a single location
        - Keys are stored with a time-to-live (TTL) and will be automatically deleted after expiry
    """)
    
    # Input fields
    private_key = st.text_input(
        "Private Key (hex)",
        help="64 characters hexadecimal, with or without '0x' prefix",
        type="password"
    )
    
    user_key_seed = st.text_input(
        "Create a Password (User Key Seed)",
        type="password",
        help="Seed used to generate your user key. This user will have default permissions to retrieve the key and sign with the key."
    )

    ttl_days = st.number_input(
        "Time to Live (days)",
        min_value=1,
        max_value=365,
        value=30,
        help="Number of days to store the key"
    )
    
    with st.expander("Optional: Add permissions for other Nillion Users", expanded=False):
        st.subheader("Compute Permissions")
        st.markdown("Enter any other Nillion User IDs that should have permission to sign with this private key")
        compute_users_text = st.text_input(
            "Compute Permissioned User IDs",
            help="Comma-separated list of User IDs (40-character hex strings) that can sign with this key"
        )
        
        compute_permissioned_user_ids = []
        if compute_users_text:
            user_ids = [uid.strip() for uid in compute_users_text.split(',') if uid.strip()]
            
            for user_id in user_ids:
                compute_permissioned_user_ids.append(user_id)
                
        compute_permissioned_user_ids = compute_permissioned_user_ids if compute_permissioned_user_ids else None
        
        st.subheader("Retrieve Permissions")
        st.markdown("Enter any other Nillion User IDs that should have permission to retrieve this private key")
        retrieve_users_text = st.text_input(
            "Retrieve Permissioned User IDs",
            help="Comma-separated list of User IDs (40-character hex strings) that can retrieve the key"
        )
        
        retrieve_permissioned_user_ids = []
        if retrieve_users_text:
            user_ids = [uid.strip() for uid in retrieve_users_text.split(',') if uid.strip()]
            
            for user_id in user_ids:
                retrieve_permissioned_user_ids.append(user_id)
        retrieve_permissioned_user_ids = retrieve_permissioned_user_ids if retrieve_permissioned_user_ids else None
    
    if st.button("Store Key"):
        # Validate input
        private_key_clean = clean_hex_input(private_key)
        
        errors = []
        if not private_key_clean:
            errors.append("Private key is required")
        elif not validate_hex(private_key_clean):
            errors.append("Private key must be a valid hexadecimal string")
        elif len(private_key_clean) != 64:
            errors.append("Private key must be exactly 64 characters (32 bytes)")
            
        if errors:
            for error in errors:
                st.error(error)
            return
            
        try:
            with st.spinner('Storing key in Nillion...'):
                # Store the key
                stored_details = asyncio.run(store_ecdsa_key(
                    private_key_clean,
                    ttl_days=ttl_days,
                    user_key_seed=user_key_seed,
                    compute_permissioned_user_ids=compute_permissioned_user_ids,
                    retrieve_permissioned_user_ids=retrieve_permissioned_user_ids
                ))
                stored_details['store_id'] = str(stored_details['store_id'])
                
                # Show success message
                st.success("✅ Key stored successfully!")
                
                st.subheader("Nillion Storage Details")
                st.json(stored_details)
                
                st.info("""
                    **Save these details to retrieve your key, sign messages with this key, or verify signatures later:**
                    - User Key Seed: The seed you used above to generate your user key
                    - Store ID: The UUID where you can access your stored ECDSA private key in Nillion
                    - Public Key: The public key corresponds to your stored private key and is used to verify signatures
                """)
                
                st.text("Store ID")
                st.code(stored_details['store_id'])

                st.text("Public Key")
                st.code(stored_details['public_key'])

                st.text("Ethereum Address")
                st.code(stored_details['ethereum_address'])
                
        except Exception as e:
            st.error(f"Error storing key: {str(e)}") 