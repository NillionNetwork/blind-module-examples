# Nillion SecretSigner Examples

These examples demonstrate how to

- Store a permissioned Private Key in Nillion
- Retrieve a Private Key from Nillion
- Sign a message with a Private Key that has been stored in Nillion

## Setup

0. run `nillion-devnet` to connect to the Devnet

1. Create a .env

```
cp .env.example .env 
```

2. Decide which Nillion Network to connect to. Update NILLION_NETWORK in .env accordingly

3. Update NILLION_NILCHAIN_PRIVATE_KEY in .env with a funded Nilchain private key for your selected Nillion Network environment.

## Run scripts with --experimental-wasm-modules flag

### Store a private key in Nillion

Update the `privateKeyToStore` in the script, then run

```
node --experimental-wasm-modules storePrivateKey.js
```

This results in the Store ID of the private key

### Retrieve a private key from Nillion by Store ID

Update the `storeId` in the script, then run

```
node --experimental-wasm-modules retrievePrivateKey.js
```

### Sign a message with a stored private key

Update the `storeId` and the `publicKey` that corresponds to the stored private key in the script, then run

```
node --experimental-wasm-modules signWithStoredPrivateKey.js
```
