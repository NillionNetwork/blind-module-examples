import streamlit as st
from views.transfer_eth import render

st.set_page_config(
    page_title="Transfer ETH",
    page_icon="💸",
)

render() 