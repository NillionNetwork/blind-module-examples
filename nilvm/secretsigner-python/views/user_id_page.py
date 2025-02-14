import streamlit as st
import asyncio
from src.nillion_utils import get_user_id_from_seed

def show():
    st.header("Get Nillion User ID from Seed")
    
    st.text("""
        Get the Nillion user ID that corresponds to a given seed.
        This is useful for setting up permissions and verifying key storage/retrieval.
    """)
    
    # Input field
    user_key_seed = st.text_input(
        "User Key Seed",
        help="The seed used to generate your user key",
        type="password"
    )
    
    if st.button("Get User ID"):
        try:
            with st.spinner('Generating user ID...'):
                # Get the user ID
                user_id = asyncio.run(get_user_id_from_seed(user_key_seed))
                
                # Show result
                st.subheader("Nillion User ID")
                st.code(user_id)
                
                # Show explanation
                st.info("""
                    This is your unique Nillion user ID for this seed.
                    The same seed will always generate the same user ID.
                    Use this ID when setting up permissions for key storage and retrieval.
                """)
                
        except Exception as e:
            st.error(f"Error getting user ID: {str(e)}") 