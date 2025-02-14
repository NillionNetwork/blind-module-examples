import streamlit as st
from src.nillion_utils import verify_signature

def show():
    st.subheader("Verify signed message")
    
    # Radio button to choose between message or hash
    input_type = st.radio(
        "Input type",
        ["Message Hash", "Full Message"],
        help="Choose whether to input the original message or its hash"
    )
    
    # Show appropriate input field based on selection
    if input_type == "Full Message":
        message = st.text_area(
            "Message",
            help="Enter the original message that was signed"
        )
        input_value = message
        is_hash = False
    else:
        hash_value = st.text_input(
            "Hash",
            help="Enter the hash that was signed (hex format)"
        )
        input_value = hash_value
        is_hash = True
    
    # Get signature components
    col1, col2 = st.columns(2)
    with col1:
        r = st.text_input("Signature r", help="r component of the signature")
    with col2:
        s = st.text_input("Signature s", help="s component of the signature")
        
    public_key = st.text_input(
        "Public Key",
        help="The public key of the signer (uncompressed format with 04 prefix)"
    )
    
    if st.button("Verify Signature"):
        if not input_value or not r or not s or not public_key:
            st.error("Please fill in all required fields")
            return
            
        try:
            result = verify_signature(
                message_or_hash=input_value,
                signature={'r': r, 's': s},
                public_key=public_key,
                is_hash=is_hash
            )
            
            if result['verified']:
                st.success("✅ Signature is valid!")
            else:
                st.error(f"❌ Invalid signature: {result.get('error', 'unknown error')}")
            
            # Show debug info in expander
            with st.expander("Debug Info"):
                st.json(result)
                
        except Exception as e:
            st.error(f"Error verifying signature: {str(e)}") 