# Nillion Private Storage with Node.js

This Node.js/TypeScript script reads all records from a Nillion Private Storage [Standard Collection](https://docs.nillion.com/build/private-storage/overview#collection-types) with direct access to all Nillion capabilities without browser constraints!

To build this app from scratch, follow the [Private Storage: Node.js Recipe](https://docs.nillion.com/build/private-storage/platform-nodejs) in the Nillion Docs.

## Working with this repo

This project is a TypeScript Node.js script that connects to Nillion's testnet.

### Create a .env

Update .env values based on your [Network API Key](/build/network-api-access) and your custom [Collection ID](/build/private-storage/collection-explorer#create-new-collections)

```bash
NILLION_API_KEY=your-api-key-here
NILLION_COLLECTION_ID=your-collection-id-here
```

In the project directory, you can run:

### `npm run dev`

Runs the TypeScript script directly using tsx.\
The script will connect to Nillion's testnet and display all records from your collection.

### `npm run build`

Compiles the TypeScript code to JavaScript.\
The compiled output will be in the project root as `read-collection.js`.

### `npm start`

Runs the compiled JavaScript version.\
Make sure to run `npm run build` first.

## Features

- Direct Node.js execution without browser constraints
- TypeScript support with full type safety
- Secure environment variable handling with dotenv
- Connects to 3 nilDB testnet nodes for reliability
- Displays formatted JSON output of all collection records

## Requirements

- Node.js 18+ 
- TypeScript 5+
- A Nillion API Key from the [Network API Access guide](https://docs.nillion.com/build/network-api-access)
- A Nillion collection ID from the [Collection Explorer](https://docs.nillion.com/build/private-storage/collection-explorer)

## Learn More

- [Nillion Documentation](https://docs.nillion.com)
- [Private Storage Overview](https://docs.nillion.com/build/private-storage/overview)
- [TypeScript Documentation](https://www.typescriptlang.org/)