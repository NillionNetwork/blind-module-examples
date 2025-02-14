import streamlit as st
import asyncio
from src.nillion_utils import get_user_id_from_seed
from src.utils import derive_eth_address, clean_hex_input, derive_public_key_from_private

def show():
    tab1, tab2, tab3 = st.tabs(["🔑 Get User ID", "📫 Derive ETH Address", "🔐 Derive Public Key"])
    
    # Tab 1: Get User ID from Seed
    with tab1:
        st.header("Get Nillion User ID from seed")
        st.text("""
            Get the Nillion user ID that corresponds to a given seed. This is useful for setting up permissions and verifying key storage/retrieval.
        """)
        
        user_key_seed = st.text_input(
            "Password (User Key Seed)",
            type="password",
            help="The seed used to generate your user key",
            key="user_key_seed_input"  # Unique key to avoid conflicts
        )
        
        if st.button("Get User ID", key="get_user_id_button"):
            try:
                with st.spinner('Generating user ID...'):
                    user_id = asyncio.run(get_user_id_from_seed(user_key_seed))
                    
                    st.subheader("Nillion User ID")
                    st.code(user_id)
                    
                    st.info("""
                        This is your unique Nillion user ID for this seed.
                        The same seed will always generate the same user ID.
                        Use this ID when setting up permissions for key storage and retrieval.
                    """)
                    
            except Exception as e:
                st.error(f"Error getting user ID: {str(e)}")
    
    # Tab 2: Derive ETH Address
    with tab2:
        st.header("Derive Ethereum Address")
        st.text("""
            Convert an ECDSA public key into its corresponding Ethereum address.
        """)
        
        st.info("""
            Note: ECDSA public key -> Ethereum address is a one-way process. You cannot derive a public key from an Ethereum address 
            because the address is created by hashing the public key and taking only the last 20 bytes.
            
            The only ways to get a public key are:
            - Derive it from a private key
            - Extract it from a valid digital signature
            - Have it provided directly by the key owner
        """)
        
        public_key = st.text_input(
            "Public Key (hex)",
            help="The uncompressed public key (130 characters starting with '04')",
            key="public_key_input"  # Unique key to avoid conflicts
        )
        
        if st.button("Derive Address", key="derive_address_button"):
            # Clean input
            public_key_clean = clean_hex_input(public_key)
            
            # Validate input
            errors = []
            if not public_key_clean:
                errors.append("Public key is required")
            elif not validate_hex(public_key_clean):
                errors.append("Public key must be a valid hexadecimal string")
            elif len(public_key_clean) != 130:
                errors.append("Public key must be exactly 130 characters (65 bytes)")
            elif not public_key_clean.startswith('04'):
                errors.append("Public key must start with '04' (uncompressed format)")
            
            if errors:
                for error in errors:
                    st.error(error)
                return
                
            try:
                # Derive Ethereum address
                eth_address = derive_eth_address(public_key_clean)
                
                # Show results
                st.subheader("Ethereum Address")
                st.code(eth_address)
                st.success("✅ Address derived successfully")
                
                # Show derivation process
                st.subheader("Derivation Process")
                st.write("1. Take the uncompressed public key (65 bytes starting with '04')")
                st.write("2. Remove the '04' prefix, leaving the x and y coordinates (64 bytes each)")
                st.write("3. Calculate the Keccak-256 hash of these coordinates")
                st.write("4. Take the last 20 bytes of the hash")
                st.write("5. Add '0x' prefix and convert to checksum format")
                    
            except Exception as e:
                st.error(f"Error deriving address: {str(e)}")
    
    # Tab 3: Derive Public Key
    with tab3:
        st.header("Derive Public Key")
        st.text("""
            Derive the uncompressed ECDSA public key from a private key.
        """)
        
        st.warning("""
            🔒 **Security Note:**
            - Never share your private key with anyone
            - This tool runs locally in your browser - your private key is not transmitted
            - For better security, consider deriving public keys in an offline environment
            - Clear your clipboard and browser history after copying sensitive data
        """)
        
        private_key = st.text_input(
            "Private Key (hex)",
            help="64 characters hexadecimal, with or without '0x' prefix",
            type="password",  # Hide the private key input
            key="private_key_input"
        )
        
        if st.button("Derive Public Key", key="derive_pubkey_button"):
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
                # Derive public key
                public_key = derive_public_key_from_private(private_key_clean)
                
                # Show results
                st.subheader("Public Key")
                st.text("Uncompressed Format (hex)")
                st.code(f"0x{public_key}")
                
                st.success("✅ Public key derived successfully")
                
                # Show derivation info
                st.info("""
                    This is your uncompressed ECDSA public key:
                    - Starts with '04' to indicate uncompressed format
                    - Followed by the X coordinate (64 hex chars)
                    - Followed by the Y coordinate (64 hex chars)
                    - Total length: 130 characters (65 bytes)
                    
                    You can use this public key to:
                    - Derive Ethereum addresses
                    - Verify signatures
                    - Share with others who need to verify your signatures
                """)
                    
            except Exception as e:
                st.error(f"Error deriving public key: {str(e)}")

def validate_hex(hex_str: str) -> bool:
    """Validate if string is valid hex"""
    try:
        int(hex_str, 16)
        return True
    except ValueError:
        return False 