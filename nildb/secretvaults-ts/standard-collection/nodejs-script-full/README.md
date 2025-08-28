# Nillion Storage for Standard Collections

This project demonstrates how to use the [Nillion SecretVault TypeScript SDK](https://github.com/NillionNetwork/secretvaults-ts) for basic CRUD operations on a collection of API keys. It showcases storing data in a **[Standard Collection](https://docs.nillion.com/build/private-storage/overview#collection-types)** with field-level encryption of API keys.

The script covers creating collections, adding/finding/updating/deleting encrypted records, and inspecting metadata. API keys are encrypted using `%share` schema markers and `%allot` data markers, while metadata like service names remain searchable as plaintext.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Nillion API Key from https://nilpay.vercel.app/

### Installation

1. **Clone the repository:**

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Set up environment variables:**

   Copy the example environment file and add your Nillion API private key from https://nilpay.vercel.app/:

   ```sh
   cp .env.example .env
   # Then edit .env to add your NILLION_API_KEY and other required values
   ```

   The tutorial includes testnet endpoints pre-configured in the example.

### Running the Tutorial

Start the development server with:

```sh
npm run dev
```

This will run the tutorial script in watch mode. Follow the console output for step-by-step CRUD operations demonstrating:

1. **Collection Creation** - Define schema with encrypted fields
2. **Record Insertion** - Add API keys with automatic encryption
3. **Data Querying** - Find records with filtering capabilities
4. **Record Updates** - Modify existing data
5. **Record Deletion** - Remove records safely
6. **Metadata Inspection** - View collection stats and builder profile

### All Scripts

- `npm run dev` — Run the tutorial in development mode (with hot reload)
- `npm run build` — Compile TypeScript to JavaScript
- `npm start` — Run the compiled code from `dist/`
- `npm run typecheck` — TypeScript type checking

## More Documentation

Check out full Nillion builder documentation [here](https://docs.nillion.com/build/quickstart)

## SecretVault SDK links

- Github: [secretvaults-ts](https://github.com/NillionNetwork/secretvaults-ts)
- npm package: [@nillion/secretvaults](https://www.npmjs.com/package/@nillion/secretvaults)
