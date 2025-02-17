import streamlit as st
from src.nillion_utils import get_nillion_network

def show():
    """Show Nillion network configuration details"""
    with st.expander("Nillion Network Configuration", expanded=False):
        try:
            network, payer = get_nillion_network()
            st.success(f"✅ Connected to Nillion: {network.chain_id}")
            st.subheader("Nillion Network Details")
            st.json({
                "nillion_chain_id": network.chain_id,
                "nillion_nilvm_bootnode": network.nilvm_grpc_endpoint,
                "nillion_nilchain_grpc": network.chain_grpc_endpoint
            })
            st.subheader("Nilchain Payment Details")
            st.text("Nilchain Payment Address")
            st.code(payer.wallet_address)
        except Exception as e:
            st.error(f"❌ Network connection error: {str(e)}") 