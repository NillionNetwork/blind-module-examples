import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = process.env.NILLION_API_KEY;
    const baseUrl =
      process.env.NILAI_API_URL?.trim().replace(/\/+$/, '') ??
      'https://api.nilai.nillion.network';

    if (!body?.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'NILLION_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: 'google/gemma-4-26B-A4B-it',
        messages: body.messages,
        temperature: 0.2,
      }),
    });

    const text = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`nilAI API returned non-JSON response: ${text.slice(0, 160)}`);
    }

    if (!response.ok) {
      const errorMessage =
        typeof data.error === 'string'
          ? data.error
          : `nilAI API request failed with status ${response.status}`;
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const content = (data as { choices?: Array<{ message?: { content?: string } }> })
      .choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('nilAI API response did not include message content');
    }

    return NextResponse.json({
      response: content,
      signature: typeof data.signature === 'string' ? data.signature : null,
    });
  } catch (error) {
    console.error('Chat error:', error);

    const message =
      error instanceof Error ? error.message : 'Failed to process chat request';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
