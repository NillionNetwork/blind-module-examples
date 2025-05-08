# Nillion Signature Tools

### Available Tools:

- **ECDSA Key Generator**: Generate new ECDSA key pairs locally
- **Store Key In Nillion**: Store your ECDSA private key in Nillion
- **Retrieve Key from Nillion**: Retrieve your stored ECDSA private key from Nillion
- **Sign Message with Nillion**: Sign simple or [SIWE](https://login.xyz/) (EIP-4361) messages securely using Nillion's threshold ECDSA via your stored private key
- **Verify Signature**: Verify the authenticity of signed messages
- **Transfer ETH**: Transfer ETH from the address corresponding to your stored private key to another address
- **Other Tools**: Explore additional dev tools that help generate a Nillion user ID from a seed, derive Ethereum addresses, and derive public keys

## Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- `nillion-devnet` for local development
- a [funded Nilchain private key](https://docs.nillion.com/guide-testnet-faucet) for Testnet development

### Installation

1. Clone the repository:
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On macOS/Linux
   .venv\Scripts\activate     # On Windows
   ```
3. Install the required packages:

   ```bash
   pip install -r requirements.txt
   ```

### Configuration

#### Local Development with nillion-devnet

For local development, simply run `nillion-devnet` and make sure that all .streamlit/sects.toml variables are commented out. Because these aren't present, the app will automatically use your local devnet configuration and payment key.

#### Connecting to Nillion Testnet

To connect to the Nillion testnet:

1. Create a streamlit secrets file:

   ```bash
   mkdir -p .streamlit
   cp .streamlit/secrets.example.toml .streamlit/secrets.toml
   ```

2. Edit `.streamlit/secrets.toml` to add [a valid Nillion Network configuration](https://docs.nillion.com/network-configuration) and a funded Nilchain key

Also add a Base Sepolia enabled Alchemy API Key to the file - alchemy_api_key

### Running the App

Start the local streamlit app:

```bash
streamlit run app.py
```
