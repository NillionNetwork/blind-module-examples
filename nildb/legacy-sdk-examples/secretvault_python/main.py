"""Main Streamlit application for credential management."""
import streamlit as st
import uuid
import pandas as pd
from typing import Dict, List

from config import NODE_CONFIG, SCHEMA_ID, NUM_NODES
import generate_tokens
from nildb_api import NilDBAPI
from encryption import DataEncryption

# Initialize services
nildb_api = NilDBAPI(NODE_CONFIG)
encryption = DataEncryption(NUM_NODES)

def init_session_state():
    """Initialize session state variables."""
    if 'credentials' not in st.session_state:
        st.session_state.credentials = []

def upload_credentials(username: str, password: str, service: str) -> bool:
    """Create and store encrypted credentials across nodes."""
    try:
        # Generate unique ID
        cred_id = str(uuid.uuid4())        
        # Encrypt password into shares
        encrypted_shares = encryption.encrypt_password(password)
        
        # Store shares across nodes
        success = True
        for i, node_name in enumerate(['node_a', 'node_b', 'node_c']):
            credentials_data = {
                    "_id": cred_id,
                    "username": username,
                    "password": encrypted_shares[i],
                    "service": service
            }
            if not nildb_api.data_upload(node_name, SCHEMA_ID, [credentials_data]):
                success = False
                break
                
        return success
    except Exception as e:
        st.error(f"Error creating credentials: {str(e)}")
        return False

def fetch_credentials() -> List[Dict]:
    """Fetch and decrypt credentials from nodes."""
    try:
        # Fetch from all nodes
        credentials = {}
        for node_name in ['node_a', 'node_b', 'node_c']:
            node_creds = nildb_api.data_read(node_name, SCHEMA_ID)
            print('node_creds', node_creds)
            for cred in node_creds:
                cred_id = cred['_id']
                if cred_id not in credentials:
                    credentials[cred_id] = {
                        'username': cred['username'],
                        'service': cred['service'],
                        'shares': []
                    }
                credentials[cred_id]['shares'].append(cred['password'])
        
        # Decrypt password
        decrypted_creds = []
        for cred_id, cred_data in credentials.items():
            if len(cred_data['shares']) == NUM_NODES:
                try:
                    password = encryption.decrypt_password(cred_data['shares'])
                    decrypted_creds.append({
                        'Service': cred_data['service'],
                        'Username': cred_data['username'],
                        'Password': password
                    })
                except Exception as e:
                    st.warning(f"Could not decrypt credentials {cred_id}: {str(e)}")
                    
        return decrypted_creds
    except Exception as e:
        st.error(f"Error fetching credentials: {str(e)}")
        return []

def main():
    st.set_page_config(page_title="Secure Credentials Manager", layout="wide")
    init_session_state()
    st.title("🔐 Secure Credentials Manager")
    
    # Credential Input Form
    st.header("Add New Credentials")
    with st.form("credential_form"):
        service = st.text_input("Service Name", placeholder="e.g., Netflix")
        username = st.text_input("Username", placeholder="Enter your username")
        password = st.text_input("Password", type="password")
        
        submitted = st.form_submit_button("Save Credentials")
        if submitted:
            if not all([service, username, password]):
                st.error("Please fill in all fields")
            else:
                with st.spinner("Encrypting and storing credentials..."):
                    # generate short-lived JTWs
                    generate_tokens.update_config()
                    if upload_credentials(username, password, service):
                        st.success("Credentials saved successfully!")
                    else:
                        st.error("Failed to save credential")

    # View Credentials
    st.header("Stored Credentials")
    if st.button("Refresh Credentials"):
        with st.spinner("Fetching and decrypting credentials..."):
            # generate short-lived JTWs
            generate_tokens.update_config()
            credentials = fetch_credentials()
            # print('credentials', credentials)
            if credentials:
                df = pd.DataFrame(credentials)
                st.dataframe(df, use_container_width=True)
            else:
                st.info("No credentials found")

if __name__ == "__main__":
    main()
