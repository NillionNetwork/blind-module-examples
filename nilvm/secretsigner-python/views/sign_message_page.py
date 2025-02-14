import streamlit as st
from src.nillion_utils import sign_message, SimpleMessageParams, SiweMessageParams
import asyncio
from urllib.parse import urlparse
from typing import Dict, NamedTuple

class Chain(NamedTuple):
    name: str
    id: int

SUPPORTED_CHAINS: Dict[str, Chain] = {
    "Ethereum": Chain("Ethereum", 1),
    "Base": Chain("Base", 8453),
    "Polygon": Chain("Polygon", 137),
    "Arbitrum One": Chain("Arbitrum One", 42161),
    "Ethereum Sepolia": Chain("Ethereum Sepolia", 11155111),
    "Base Sepolia": Chain("Base Sepolia", 84532),
    "Polygon Sepolia": Chain("Polygon Sepolia", 80001),
    "Arbitrum Sepolia": Chain("Arbitrum Sepolia", 421614)
}

def show():    
    # Get required store_id and user_key_seed inputs
    store_id = st.text_input("Store ID", help="The Nillion Store ID for the private key")
    user_key_seed = st.text_input("Password (User Key Seed)", help="Seed for generating a user key with compute permissions", type="password")
    
    # Create tabs for different message types
    tab1, tab2 = st.tabs(["Simple Message", "SIWE Message"])
    
    with tab1:
        simple_message = st.text_area("Message", help="Enter the message you want to sign")
        
        if st.button("Sign Simple Message"):
            if not store_id or not user_key_seed or not simple_message:
                st.error("Please fill in all required fields")
                return
                
            try:
                with st.spinner("Signing message with private key in Nillion..."):
                    message_params = SimpleMessageParams(message=simple_message)
                    result = asyncio.run(sign_message(
                        store_id_private_key=store_id,
                        message_params=message_params,
                        user_key_seed=user_key_seed
                    ))
                
                # Display results
                st.success("Message signed successfully!")
                st.json(result)
                
            except Exception as e:
                st.error(f"Error signing message: {str(e)}")
    
    with tab2:
        
        # Required SIWE fields
        domain = st.text_input(
            "Domain", 
            help="The domain name without protocol (e.g., 'example.com' not 'https://example.com')"
        )
        # Clean up domain input by removing protocol and path if present
        if domain:
            parsed = urlparse(domain)
            domain = parsed.netloc or parsed.path  # fallback to path if netloc is empty
            domain = domain.split('/')[0]  # remove any path components
        ethereum_address = st.text_input("Ethereum Address", help="The Ethereum address that corresponds to the stored private key used for signing")
        
        with st.expander("Optional extra SIWE parameters"):
            col1, col2 = st.columns(2)
            with col1:
                uri = st.text_input("URI", help="The URI from which the signing request originated")
                version = st.text_input("Version", value="1", help="SIWE version")
                selected_chain = st.selectbox(
                    "Chain",
                    options=list(SUPPORTED_CHAINS.keys()),
                    help="Select the blockchain network"
                )
                chain_id = SUPPORTED_CHAINS[selected_chain].id
            with col2:
                nonce = st.text_input("Nonce", help="Unique nonce for the message (auto-generated if empty)")
                statement = st.text_area("Statement", help="Human-readable statement about the signing request")
            
            st.markdown("### Advanced Parameters")
            col3, col4 = st.columns(2)
            with col3:
                issued_at = st.text_input("Issued At", help="ISO 8601 datetime when the message was issued")
                expiration_time = st.text_input("Expiration Time", help="ISO 8601 datetime when the message expires")
                not_before = st.text_input("Not Before", help="ISO 8601 datetime before which message is not valid")
            with col4:
                request_id = st.text_input("Request ID", help="Request ID for the signing request")
                resources = st.text_area("Resources", help="List of resources (one per line)")
        
        if st.button("Sign SIWE Message"):
            if not store_id or not user_key_seed or not domain or not ethereum_address:
                st.error("Please fill in all required fields")
                return
                
            try:
                with st.spinner("Signing SIWE message with private key in Nillion..."):
                    # Convert resources string to list if provided
                    resources_list = None
                    if resources:
                        resources_list = [r.strip() for r in resources.split('\n') if r.strip()]
                    
                    # Create SIWE message parameters
                    message_params = SiweMessageParams(
                        domain=domain,
                        ethereum_address=ethereum_address,
                        uri=uri or None,
                        version=version,
                        chain_id=SUPPORTED_CHAINS[selected_chain].id,
                        nonce=nonce or None,
                        issued_at=issued_at or None,
                        expiration_time=expiration_time or None,
                        not_before=not_before or None,
                        request_id=request_id or None,
                        resources=resources_list,
                        statement=statement or None
                    )
                    
                    result = asyncio.run(sign_message(
                        store_id_private_key=store_id,
                        message_params=message_params,
                        user_key_seed=user_key_seed
                    ))
                
                # Display results
                st.success("SIWE message signed successfully!")
                st.json(result)
                
            except Exception as e:
                st.error(f"Error signing SIWE message: {str(e)}") 