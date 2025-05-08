import streamlit as st
from src.utils import derive_eth_address, clean_hex_input

def show():
    st.write("Convert an ECDSA public key into its corresponding Ethereum address.")
    
    st.info("""
        Note: ECDSA public key -> Ethereum address is a one-way process. You cannot derive a public key from an Ethereum address 
        because the address is created by hashing the public key and taking only the last 20 bytes.
        
        The only ways to get a public key are:
        - Derive it from a private key
        - Extract it from a valid digital signature
        - Have it provided directly by the key owner
    """)
    
    # Input field for public key
    st.markdown("### Enter your ECDSA public key")
    
    public_key = st.text_input(
        "Public Key (hex)",
        help="The uncompressed public key (with or without '0x' prefix)"
    )
    
    if st.button("Derive ETH Address"):
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