require('dotenv').config();
const express = require('express');
const { paymentMiddleware } = require('x402-express');
const app = express();
const port = 3000;

// Load environment variables
const SECRET_MESSAGE = process.env.SECRET_MESSAGE || 'Default secret message';
const WALLET_ADDRESS =
  process.env.WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f8fA49';

// Middleware to parse JSON
app.use(express.json());

// Configure x402 payment middleware
app.use(
  paymentMiddleware(
    WALLET_ADDRESS,
    {
      'GET /buy-secrets': {
        price: '$0.001',
        network: 'base-sepolia',
        config: {
          description: 'Purchase access to the secret string',
        },
      },
    },
    {
      url: 'https://x402.org/facilitator', // Base Sepolia testnet facilitator
    }
  )
);

// GET endpoint to return hello world
app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// GET endpoint with parameter
app.get('/hello/:name', (req, res) => {
  res.json({ message: `Hello ${req.params.name}!` });
});

// POST endpoint
app.post('/data', (req, res) => {
  res.json({
    received: req.body,
    timestamp: new Date().toISOString(),
  });
});

// Protected endpoint - requires payment
app.get('/buy-secrets', (req, res) => {
  res.json({
    secret: SECRET_MESSAGE,
    message: 'Thank you for your payment!',
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
