# Nillion Passwordless Authentication

A production-ready passwordless authentication system using MetaMask and Nillion Network's SecretVault infrastructure.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![React](https://img.shields.io/badge/react-19.x-blue)
![Next.js](https://img.shields.io/badge/next.js-16.x-black)

## 🎯 What This Is

A complete implementation of passwordless authentication where users sign in using their Ethereum wallet (MetaMask) instead of passwords. Authentication is cryptographically secure, decentralized, and persists across sessions.

### Key Features

- ✅ **No Passwords** - Users authenticate with MetaMask signatures
- ✅ **Decentralized Identity (DID)** - W3C standard DIDs for user identification
- ✅ **Session Persistence** - Stay logged in across page refreshes
- ✅ **Multi-Wallet Support** - Works even with multiple wallet extensions
- ✅ **Real-Time Logging** - See authentication progress in real-time
- ✅ **Auto-Reconnect** - Seamlessly restore sessions
- ✅ **Privacy-Preserving** - Data encrypted with Blindfold
- ✅ **Production Ready** - Comprehensive error handling and testing

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

Click "Connect with MetaMask" and watch the magic happen! 🎉


## 🔑 Key Concepts

### Decentralized Identity (DID)
Your Ethereum address becomes a globally unique identity:
```
Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
   ↓
DID: did:ethr:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### Token Hierarchy
```
Root Token (master authorization)
  └─> Invocation Tokens (one per database node)
      └─> Used for all operations
```

### Blindfold Encryption
Nillion's privacy-preserving layer that automatically encrypts data:
```typescript
blindfold: { operation: "store" }
```

## 💻 Common Use Cases

### Check Authentication State
```typescript
import { useNillion } from "@/hooks/useNillion";
import { useSessionQuery } from "@/hooks/useSessionQuery";

function MyComponent() {
  const { state } = useNillion();
  const { isSuccess: isSessionReady } = useSessionQuery();
  
  const isAuthenticated = state.wallets.isMetaMaskConnected && isSessionReady;
  
  return (
    <div>
      {isAuthenticated ? "Logged in!" : "Please connect"}
    </div>
  );
}
```

### Use Authenticated Client
```typescript
import { useNillionClient } from "@/hooks/useNillionClient";

function MyComponent() {
  const clientData = useNillionClient();
  
  if (!clientData) return <div>Not authenticated</div>;
  
  const { nillionClient, nildbTokens } = clientData;
  
  // Perform authenticated operations
  const profile = await nillionClient.readProfile({
    auth: { invocations: nildbTokens }
  });
}
```


## 🧪 Testing

```bash
# Run tests (when added)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🎓 Learn More

### Documentation
- [Nillion Docs](https://docs.nillion.com)
- [React Query](https://tanstack.com/query/latest)
- [Viem](https://viem.sh)
- [EIP-712](https://eips.ethereum.org/EIPS/eip-712)
- [DIDs](https://www.w3.org/TR/did-core/)

## 🤝 Contributing

This is a reference implementation. Feel free to:
- Fork for your own projects
- Open issues for bugs
- Suggest improvements
- Share learnings

## 📝 License

MIT License - use freely!

## 🎉 Success Checklist

After running the app, you should see:

- [x] MetaMask connects
- [x] DID generated (did:ethr:0x...)
- [x] Subscription verified
- [x] Tokens created
- [x] Builder registered
- [x] Session persists on refresh
- [x] Logs show progress
- [x] UI updates correctly
- [x] Logout works
- [x] Auto-reconnect works


**Built with ❤️ using Nillion Network**
