require('dotenv').config();

async function generateText() {
  try {
    const apiKey = process.env.NILLION_API_KEY;
    if (!apiKey) {
      throw new Error('NILLION_API_KEY is not set');
    }

    const messages = [
      {
        role: 'user',
        content: 'Hello! Can you help me with something?',
      },
    ];

    const baseUrl =
      process.env.NILAI_API_URL?.trim().replace(/\/+$/, '') ??
      'https://api.nilai.nillion.network';

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages,
      }),
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`nilAI API returned non-JSON response: ${text.slice(0, 160)}`);
    }

    if (!response.ok) {
      const message =
        typeof data.error === 'string'
          ? data.error
          : `nilAI API request failed with status ${response.status}`;
      throw new Error(message);
    }

    if (typeof data.signature === 'string') {
      console.log(`Signature: ${data.signature}`);
    }
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('nilAI API response did not include message content');
    }
    console.log(`Response: ${content}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

generateText();
