# SecretSigner Python Examples

## Setup

### 1. Install dependencies

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Create .env

```
cp .env.example .env
```

Set your NILLION_NETWORK_CONFIG, NILLION_USER_KEY_SEED, and NILLION_NILCHAIN_PRIVATE_KEY

## Run examples

#### Store a private key

Optionally add the private key you want to store as a parameter, then run:

```
python3 storePrivateKey.py
```

The storePrivateKey.py file connects to the Nillion network to securely store an ECDSA private key, either by using an existing key provided as a hex string or by generating a new one if none is supplied. It initializes a client, funds it with UNIL, and stores the private key along with the necessary permissions for signing messages, outputting the store ID and corresponding public key upon completion.

#### Retrieve a private key by store id

**Update the store id within the file, then run:**

```
python3 storePrivateKey.py
```

The retrievePrivateKey.py file connects to the Nillion network to retrieve an ECDSA private key associated with a specified store ID. It initializes a client, funds it with UNIL, and then retrieves the private key, along with deriving and printing the corresponding public key for further use.

#### Sign with a stored private key

**Update the store id, associated public key, and message to sign within the file, then run:**

```
 python3 signWithStoredPrivateKey.py
```

The signWithStoredPrivateKey.py file is designed to sign a message using a stored private key within the Nillion network. It establishes a connection to the Nillion blockchain, creates a client with a user key, and funds the client with UNIL tokens. The script then hashes the message, sets up the necessary input and output bindings for the signing computation, executes the signing process, retrieves the resulting signature, and verifies it against a provided public key, printing the results at each step.
