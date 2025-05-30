// app/api/test-create/route.ts
import { error } from 'console';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = `${process.env.NODE_A_URL}/api/v1/data/create`;
const SCHEMA_ID = process.env.SCHEMA_ID;

export async function POST(request: NextRequest) {
  try {
    console.log('Starting test create...');

    // Create the payload
    const payload = {
      schema: SCHEMA_ID,
      data: [
        {
          _id: '1656e766-6be4-5725-93d9-8e739100f96d', // To be a unique UUIDv4
          username: 'my_username',
          password: 'cat',
          service: 'netflix',
          registered_at: '2022-01-01T00:00:00Z',
        },
      ],
    };

    // Make the request
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NODE_A_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Response status:', response.status);

    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${responseText}`
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.log('Response was not JSON:', responseText);
      data = responseText;
    }

    return NextResponse.json({ success: true, data, error });
  } catch (error) {
    console.error('Error in test create:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
