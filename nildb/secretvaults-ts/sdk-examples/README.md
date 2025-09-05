# SecretVaults TypeScript SDK Examples

Examples demonstrating how to work with Nillion's [SecretVaults Typescript SDK](https://github.com/NillionNetwork/secretvaults-ts) for both standard and owned data collections.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and add your API key
cp .env.example .env

# Run full examples
npm run example:standard  # Complete standard collections workflow
npm run example:owned     # Complete owned collections workflow

# Or run specific examples directly
tsx standard-collections/create-standard-collection.ts
tsx owned-collections/create-owned-collection.ts
```

Get your Nillion API key at: https://docs.nillion.com/build/network-api-access

## Environment Variables

### A Nillion API Key for all examples:

- `NILLION_API_KEY` - Your Nillion API key

### Required for user operations:

- `NILLION_USER_KEY` - User private key (for SecretVaultUserClient)

### Optional for specific examples:

- `NILLION_COLLECTION_ID` - Collection ID for standard collections and read/update/delete operations
- `NILLION_OWNED_COLLECTION_ID` - Owned collection ID
- `NILLION_OWNED_RECORD_ID` - Owned record/document ID
- `NILLION_DELEGATION_TOKEN` - Delegation token for owned data operations
- `NILLION_GRANTEE_DID` - DID to grant access to
- `NILLION_DOCUMENT_ID` - Document/record ID for operations

## Examples

### Utility Scripts

- **nuc-helpers.ts** - Generate a new keypair and other NUC utilities
- **client-helpers.ts** - Helper functions for initializing SecretVault clients
- **schema-examples.ts** - Reusable collection schemas (e.g., contact book)

### Shared Operations (`shared/`)

Examples that work with both standard and owned collections:

- **read-collection.ts** - Read a specific collection by ID (works for both standard and owned)
- **read-collections.ts** - List all collections for your builder profile (shows both types)

### Standard Collections (`standard-collections/`)

Examples for working with standard collections (builder-managed data):

- **create-standard-collection.ts** - Create a new encrypted collection with a schema
- **create-standard-record.ts** - Create records in a standard collection
- **update-record.ts** - Update records in a standard collection
- **delete-record.ts** - Delete records from a standard collection
- **find-record.ts** - Find records using queries
- **full-example-standard.ts** - Complete workflow for standard collections

### Owned Collections (`owned-collections/`)

Examples for working with owned collections (user-managed data with ACLs):

#### User Identity & Profile

- **check-user-identity.ts** - Display user DID, public key, and connected nodes
- **read-user-profile.ts** - Read user profile information (automatically created after first data interaction)

#### Collection & Data Management

- **create-owned-collection.ts** - Create an owned collection (user-specific data)
- **create-delegation-token.ts** - Generate delegation tokens for user permissions
- **create-owned-data.ts** - Create encrypted data in an owned collection with ACL
- **list-owned-records.ts** - List all owned records for a user
- **read-owned-record.ts** - Read a specific owned record
- **delete-owned-record.ts** - Delete owned data with confirmation prompt
- **full-example-owned.ts** - Complete workflow for owned collections

#### Access Control

- **grant-access.ts** - Grant read/write/execute permissions to another DID
- **revoke-access.ts** - Revoke access permissions from a specific DID

## Scripts

```bash
# Run full examples
npm run example:standard  # Run complete standard collections workflow
npm run example:owned     # Run complete owned collections workflow

# Development
npm run dev    # Run owned collections full example (default)
npm run build  # Compile TypeScript files
npm start      # Run compiled JavaScript
```

## Client Types

This SDK provides two main client types:

1. **SecretVaultBuilderClient** - For builders to manage collections and schemas
2. **SecretVaultUserClient** - For users to interact with owned data and access control

See `client-helpers.ts` for initialization examples of both client types.

## Documentation

This repo is used for the code examples in the [Secretvaults SDK TypeScript Usage Guide](http://docs.nillion.com/build/private-storage/ts-usage-guide)

For full secretvaults-ts documentation, visit: https://nillion.pub/secretvaults-ts/classes/SecretVaultBuilderClient.html
