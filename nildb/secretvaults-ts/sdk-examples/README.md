# SecretVaults TypeScript SDK Examples

Examples demonstrating how to work with Nillion's [SecretVaults Typescript SDK](https://github.com/NillionNetwork/secretvaults-ts) for standard data collections.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and add your API key
cp .env.example .env

# Run an example
npm run dev
# or
tsx create-standard-collection.ts
```

Get your Nillion API key at: https://docs.nillion.com/build/network-api-access

## Examples

- **create-standard-collection.ts** - Create a new encrypted collection with a schema
- **read-collection.ts** - Read a specific collection by ID
- **read-collections.ts** - List all collections for your builder profile
- **schema-examples.ts** - Reusable collection schemas (e.g., contact book)

## Scripts

```bash
npm run dev    # Run read-collections.ts example
npm run build  # Compile TypeScript files
npm start      # Run compiled JavaScript
```

## Documentation

For full documentation, visit: https://nillion.pub/secretvaults-ts/classes/SecretVaultBuilderClient.html
