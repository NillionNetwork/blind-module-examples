import { NilaiOpenAIClient, NilAuthInstance } from '@nillion/nilai-ts';
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NILLION_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'NILLION_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Initialize the client in API key mode
    const client = new NilaiOpenAIClient({
      baseURL: 'https://nilai-a779.nillion.network/nuc/v1/',
      apiKey: process.env.NILLION_API_KEY,
      nilauthInstance: NilAuthInstance.SANDBOX,
    });

    // Make a request to the Nilai API
    const response = await client.chat.completions.create({
      model: 'meta-llama/Llama-3.2-3B-Instruct',
      messages: [{ role: 'user', content: message }],
    });

    const content = response.choices[0].message.content;

    return NextResponse.json({ response: content });
  } catch (error) {
    console.error('Error calling Nilai API:', error);
    return NextResponse.json(
      { error: 'Failed to get response from Nilai AI' },
      { status: 500 }
    );
  }
}
