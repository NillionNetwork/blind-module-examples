import streamlit as st
from views import store_key_page, sidebar_view
from src.nillion_utils import get_nillion_network

st.set_page_config(
    page_title="Store Key In Nillion",
    page_icon="🔐",
    initial_sidebar_state="expanded"
)

sidebar_view.show()

st.title("Store Key In Nillion")
store_key_page.show() 