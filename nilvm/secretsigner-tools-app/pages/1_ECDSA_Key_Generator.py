import streamlit as st
from views import key_generator_page, sidebar_view

st.set_page_config(
    page_title="ECDSA Key Generator",
    page_icon="🔏",
    initial_sidebar_state="expanded"
)

# Show sidebar
sidebar_view.show()

st.title("ECDSA Key Generator")
key_generator_page.show() 