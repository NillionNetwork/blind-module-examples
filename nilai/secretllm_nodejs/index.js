const OpenAI = require('openai');
require('dotenv').config();

// Initialize the OpenAI client
// baseURL is the nilAI node url: https://docs.nillion.com/network#nilai-nodes
// apiKey is your nilAI node api key: https://docs.nillion.com/build/secretLLM/access
const client = new OpenAI({
  baseURL: 'https://nilai-a779.nillion.network/v1',
  apiKey: process.env.NILAI_API_KEY || 'YOUR_API_KEY_HERE'
});

async function generateText() {
  try {
    const response = await client.chat.completions.create({
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      messages: [
        {
          role: 'system',
          content: 'You are a fitness coach.'
        },
        {
          role: 'user',
          content: 'What is better for you, salad or pizza?'
        }
      ],
      stream: false
    });

    // Every SecretLLM response includes a cryptographic signature for verification
    console.log(`Signature: ${response.signature}`);
    console.log(`Response: ${response.choices[0].message.content}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

generateText();