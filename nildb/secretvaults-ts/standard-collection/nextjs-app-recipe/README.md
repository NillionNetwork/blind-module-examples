# Nillion Private Storage with Next.js

This Next.js app reads all records from a Nillion Private Storage [Standard Collection](https://docs.nillion.com/build/private-storage/overview#collection-types) using secure API routes that keep your API keys safe on the server!

To build this app from scratch, follow the [Private Storage: Next.js Recipe](https://docs.nillion.com/build/private-storage/platform-nextjs) in the Nillion Docs.

## Working with this repo

This project uses Next.js 15 with the App Router and TypeScript.

### Create a .env.local

Update .env.local values based on your [Network API Key](/build/network-api-access) and your custom [Collection ID](/build/private-storage/collection-explorer#create-new-collections)

```bash
NILLION_API_KEY=your-api-key-here
NILLION_COLLECTION_ID=your-collection-id-here
```

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload when you make edits.\
You will see any lint errors in the console.

### `npm run build`

Builds the app for production to the `.next` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm start`

Runs the built app in production mode.\
Make sure to run `npm run build` first.

## Features

- **Secure API Routes** - Your Nillion API key stays on the server, never exposed to browsers
- **TypeScript Support** - Full type safety throughout the application
- **Server-Side Execution** - Connects directly to 3 nilDB testnet nodes from the server
- **Clean Architecture** - Separation of concerns with API routes and client components
- **Error Handling** - Clear error messages and environment variable validation

## Architecture

This app uses Next.js API routes to:
- Keep your API credentials secure on the server
- Make requests to Nillion's testnet from a trusted environment
- Provide a clean JSON API for your frontend

The frontend fetches data from `/api/read-collection` which handles all Nillion communication server-side.

## Requirements

- Node.js 18+
- Next.js 15+
- A Nillion API Key from the [Network API Access guide](https://docs.nillion.com/build/network-api-access)
- A Nillion collection ID from the [Collection Explorer](https://docs.nillion.com/build/private-storage/collection-explorer)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Nillion Documentation](https://docs.nillion.com)
- [Private Storage Overview](https://docs.nillion.com/build/private-storage/overview)