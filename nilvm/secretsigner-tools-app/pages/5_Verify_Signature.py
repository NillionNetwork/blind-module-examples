import streamlit as st
from views import verify_signature_page, sidebar_view

st.set_page_config(
    page_title="Verify Signature",
    page_icon="✅",
    initial_sidebar_state="expanded"
)

sidebar_view.show()

st.title("Verify Signature")
verify_signature_page.show() 