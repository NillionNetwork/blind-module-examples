# Secret Vault

<img width="1316" alt="image" src="https://github.com/user-attachments/assets/f7fc394e-a881-46c6-82df-4165d92e859d" />

1. Install all requirements (`pip install -r requirements.txt`)
2. Edit `.streamlit/secrets.toml` and add your org credentials
3. Use `generate.py` to generate your JWT tokens and add them to `.streamlit/secrets.toml`
4. Use `define.py` to define your collection and register it on the nodes
5. Run `streamlit run main.py`
