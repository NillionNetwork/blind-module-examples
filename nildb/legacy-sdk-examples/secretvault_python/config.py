"""Configuration settings for the credential manager."""
import streamlit as st

# Node configurations
NODE_CONFIG = {
    'node_a': {
        'url': st.secrets["node_a"]["url"],
        'did': st.secrets["node_a"]["did"]
    },
    'node_b': {
        'url': st.secrets["node_b"]["url"],
        'did': st.secrets["node_b"]["did"]
    },
    'node_c': {
        'url': st.secrets["node_c"]["url"],
        'did': st.secrets["node_c"]["did"]
    },
}

# Schema ID for credential storage
SCHEMA_ID = st.secrets["schema_id"]

# Org DID
ORG_DID = st.secrets["org_did"]

# Org secret key
ORG_SECRET_KEY = st.secrets["org_secret_key"]

# Number of nodes for secret sharing
NUM_NODES = len(NODE_CONFIG)