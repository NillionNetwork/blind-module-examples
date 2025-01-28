"""Configuration settings for the credential manager."""
import os
import streamlit as st

# Node configurations
NODE_CONFIG = {
    'node_a': {
        'url': st.secrets["node_a"]["url"],
        'jwt': st.secrets["node_a"]["jwt"],
    },
    'node_b': {
        'url': st.secrets["node_b"]["url"],
        'jwt': st.secrets["node_b"]["jwt"],
    },
    'node_c': {
        'url': st.secrets["node_c"]["url"],
        'jwt': st.secrets["node_c"]["jwt"],
    },
}

# Schema ID for credential storage
SCHEMA_ID = st.secrets["schema_id"]

# Org DID for defining collections
ORG_DID = st.secrets["org_did"]

# Org DID for defining collections
ORG_SECRET_KEY = st.secrets["org_secret_key"]

# Number of nodes for secret sharing
NUM_NODES = len(NODE_CONFIG)