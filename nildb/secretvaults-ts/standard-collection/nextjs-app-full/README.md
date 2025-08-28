# Nillion SecretVault - Next.js API Keys Manager

This Next.js application demonstrates how to use the [Nillion SecretVault TypeScript SDK](https://github.com/NillionNetwork/secretvaults-ts) for managing API keys with field-level encryption in a **[Standard Collection](https://docs.nillion.com/build/private-storage/overview#collection-types)**.

The app provides a full-stack interface for creating collections, adding/finding/updating/deleting encrypted API key records, and inspecting metadata. API keys are encrypted using `%share` schema markers and `%allot` data markers, while metadata like service names remain searchable as plaintext.

## Features

- 🔐 **Encrypted Storage** - API keys are automatically encrypted using Nillion's SecretVault
- 🌐 **REST API** - Full CRUD operations via Next.js API routes
- 📱 **Interactive UI** - Real-time dashboard for managing API keys
- 🔍 **Search & Filter** - Find records by service name
- 📊 **Metadata** - View collection statistics and builder profile

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Nillion API Key from https://nilpay.vercel.app/

### Installation

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Set up environment variables:**
   Copy the example environment file and add your Nillion API private key:
   ```sh
   cp .env.example .env.local
   # Then edit .env.local to add your NILLION_API_KEY and other required values
   ```

### Running the Application

Start the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

The interface will guide you through:
1. **Creating a Collection** - Define schema with encrypted fields
2. **Adding API Keys** - Store encrypted credentials with automatic sample data
3. **Viewing Records** - Browse and filter your encrypted API keys
4. **Managing Data** - Add new records and delete existing ones

## API Endpoints

The application exposes 6 focused, single-purpose API endpoints:

- `POST /api/createCollection` - Create a new collection (body: `{ name }`)
- `GET /api/getMetadata?collectionId=<id>` - Get collection metadata
- `POST /api/writeRecord` - Add new records (body: `{ collectionId, records }`)
- `GET /api/readRecord?collectionId=<id>&service=<service>` - Find records (service filter optional)
- `PUT /api/updateRecord` - Update existing records (body: `{ collectionId, filter, update }`)
- `DELETE /api/deleteRecord?collectionId=<id>&service=<service>` - Delete records by filter

### Profile
- `GET /api/profile` - Get builder profile information

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Run ESLint

## Architecture

```
app/
├── api/                    # Next.js API routes
│   ├── collections/        # Collection management
│   └── profile/           # Builder profile
├── page.tsx               # Main UI interface
lib/
├── config.ts              # Environment configuration
├── secretvault.ts         # Nillion client utilities
└── types.ts               # TypeScript interfaces
```

## More Documentation

- [Nillion Builder Documentation](https://docs.nillion.com/build/quickstart)
- [SecretVault TypeScript SDK](https://github.com/NillionNetwork/secretvaults-ts)
- [npm package: @nillion/secretvaults](https://www.npmjs.com/package/@nillion/secretvaults)
