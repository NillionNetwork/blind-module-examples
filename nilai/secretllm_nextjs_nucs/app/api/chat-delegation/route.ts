import {
  NilaiOpenAIClient,
  DelegationTokenServer,
  AuthType,
  type DelegationTokenRequest,
  type DelegationTokenResponse,
  NilAuthInstance,
} from '@nillion/nilai-ts';
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

    // >>> Server initializes a delegation token server
    // The server is responsible for creating delegation tokens
    // and managing their expiration and usage.
    const server = new DelegationTokenServer(API_KEY, {
      nilauthInstance: NilAuthInstance.SANDBOX,
      expirationTime: 10, // 10 seconds validity of delegation tokens
      tokenMaxUses: 1, // 1 use of a delegation token
    });

    // >>> Client initializes a client
    // The client is responsible for making requests to the Nilai API.
    // We do not provide an API key but we set the auth type to DELEGATION_TOKEN
    const client = new NilaiOpenAIClient({
      baseURL: 'https://nilai-a779.nillion.network/v1/',
      authType: AuthType.DELEGATION_TOKEN,
    });

    // >>> Client produces a delegation request
    const delegationRequest: DelegationTokenRequest =
      client.getDelegationRequest();

    // <<< Server creates a delegation token
    const delegationToken: DelegationTokenResponse =
      await server.createDelegationToken(delegationRequest);

    // >>> Client sets internally the delegation token
    client.updateDelegation(delegationToken);

    // >>> Client uses the delegation token to make a request
    const response = await client.chat.completions.create({
      model: 'google/gemma-3-27b-it',
      messages: [{ role: 'user', content: message }],
    });

    const content = response.choices[0].message.content;

    return NextResponse.json({ response: content });
  } catch (error) {
    console.error('Error calling Nilai API with delegation:', error);
    return NextResponse.json(
      { error: 'Failed to get response from Nilai AI with delegation' },
      { status: 500 }
    );
  }
}
