import streamlit as st
from views import network_config_view, sidebar_view

st.set_page_config(page_title="Nillion Signature Tools", page_icon="🔏")

sidebar_view.show()

st.title("Nillion Signature Tools")

st.write("A suite of tools for local key pair generation and Nillion's private key storage + threshold ECDSA signing. Experiment with key storage and signature operations on the Nillion Network.")

st.markdown("""
### Available Tools:
- **[ECDSA Key Generator](/ECDSA_Key_Generator)**: Generate new ECDSA key pairs locally
- **[Store Key In Nillion](/Store_Key_In_Nillion)**: Store your ECDSA private key in Nillion
- **[Retrieve Key from Nillion](/Retrieve_Key_from_Nillion)**: Retrieve your stored ECDSA private key from Nillion
- **[Sign Message with Nillion](/Sign_Message_with_Nillion)**: Sign simple or [SIWE](https://login.xyz/) (EIP-4361) messages securely using Nillion's threshold ECDSA via your stored private key
- **[Verify Signature](/Verify_Signature)**: Verify the authenticity of signed messages
- **[Transfer ETH](/Transfer_ETH)**: Transfer ETH from the address corresponding to your stored private key to another address
- **[Other Tools](/Other_Tools)**: Explore additional dev tools that help generate a Nillion user ID from a seed, derive Ethereum addresses, and derive public keys
""")

network_config_view.show()