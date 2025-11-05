# Dockerized REST API with x402 Payments

A minimal REST API with Express.js and x402 payment integration.

## Quick Start

### Local Development

```bash
npm install
cp .env.example .env  # Add your wallet address
npm start
```

### Docker

```bash
FILES=. SECRET_MESSAGE="Your secret" WALLET_ADDRESS=0xYourAddress docker-compose up
```

API runs at http://localhost:3000

## Environment Variables

```env
SECRET_MESSAGE="Your secret message here"
WALLET_ADDRESS=0xYourWalletAddressHere
```

## Endpoints

### Free

- `GET /` - Hello World
- `GET /hello/:name` - Personalized greeting
- `POST /data` - Echo JSON data with timestamp

### Paid ($0.001)

- `GET /buy-secrets` - Returns secret message (requires x402 payment)

## Docker Commands

```bash
# Start with environment variables
FILES=. SECRET_MESSAGE="Your secret" WALLET_ADDRESS=0xYourAddress docker-compose up

# Stop
docker-compose down

# View logs
docker-compose logs -f
```

## Testing Payment Endpoint

```bash
# First request returns 402 Payment Required
curl http://localhost:3000/buy-secrets

# Complete payment with x402 client, then retry with X-PAYMENT header
```

Learn more: https://x402.org

## Docker Debugging

### File Mounting

This project uses environment variable-based file mounting:

```yaml
volumes:
  - $FILES/index.js:/app/index.js
  - $FILES/package.json:/app/package.json
  - $FILES/package-lock.json:/app/package-lock.json
```

- `$FILES` must be set to `.` for local development
- Deployment platforms set `$FILES` automatically
- Only specific files are mounted (not entire directory)

### Common Issues

**"The FILES variable is not set"**

```bash
# Always include FILES=. when running locally
FILES=. docker-compose up
```

**Python/node-gyp errors**

- Uses `node:20` image (not alpine) to include build tools
- Required for x402 native dependencies

**SyntaxError: Unexpected end of input**

- Ensure index.js has a newline at the end of file
- Try `docker-compose down` then rebuild
