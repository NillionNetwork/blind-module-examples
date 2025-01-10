// app/api/verify-jwt/route.ts
import { NextRequest, NextResponse } from 'next/server';

const NODE_CONFIG = [
  {
    url: 'https://nildb-node-dvml.sandbox.app-cluster.sandbox.nilogy.xyz/api/v1',
    jwt: process.env.NODE_A_JWT!, // replace with the actual JWT for node_a
  },
  {
    url: 'https://nildb-node-guue.sandbox.app-cluster.sandbox.nilogy.xyz/api/v1',
    jwt: process.env.NODE_B_JWT!, // replace with the actual JWT for node_a
  },
  {
    url: 'https://nildb-node-a50d.sandbox.app-cluster.sandbox.nilogy.xyz/api/v1',
    jwt: process.env.NODE_C_JWT!, // replace with the actual JWT for node_a
  },
];

export async function POST(request: NextRequest) {
  // Extract the token from the request headers
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Missing Authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1]; // Expecting format "Bearer <token>"

  try {
    // Iterate over nodes and verify the JWT with the first node for demonstration
    const response = await fetch(`${NODE_CONFIG[0].url}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Forward the token to the node
      },
      body: JSON.stringify({}), // Adjust body as necessary based on your node's API
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: responseData.error || 'Unauthorized' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: 'JWT is valid', data: responseData },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
