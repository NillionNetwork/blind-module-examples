# Node.js Private Chatbot with SecretLLM Example

### 1. Install dependencies

```bash
npm i
```

### 2. Create a .env file

```
cp .env.example .env
```

### 3. Add your nilAI credential to your .env

Create an API key from https://nilai.nillion.com/.

Add it to your .env file:

```
NILLION_API_KEY=YOUR_API_KEY_HERE
```

This example uses direct API-key authentication only (`Bearer` token).

- Base URL: `https://api.nilai.nillion.network/v1/`
- Model: `google/gemma-4-26B-A4B-it`

### 4. Generate text:

```
node index.js
```
