// import { NextApiRequest, NextApiResponse } from 'next';
import { NODE_CONFIG } from '../../lib/config';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Detailed environment variable validation
    for (const [nodeName, config] of Object.entries(NODE_CONFIG)) {
      if (!config.url || config.url.includes('your_node')) {
        console.error(`Invalid URL for ${nodeName}: ${config.url}`);
        return NextResponse.json(
          { error: `Missing or invalid URL configuration for ${nodeName}` },
          { status: 500 }
        );
      }
      if (!config.jwt || config.jwt.includes('your_jwt')) {
        return NextResponse.json(
          { error: `Missing JWT configuration for ${nodeName}` },
          { status: 500 }
        );
      }
    }

    const results = await Promise.all(
      Object.entries(NODE_CONFIG).map(async ([nodeName, nodeConfig]) => {
        console.log(
          `Attempting to get schema version on ${nodeName} at URL: ${nodeConfig.url}`
        );

        const headers = {
          Authorization: `Bearer ${nodeConfig.jwt}`,
          'Content-Type': 'application/json',
        };

        const url = new URL('/api/v1/schemas', nodeConfig.url).toString();
        console.log(`Full URL for ${nodeName}: ${url}`);

        const response = await fetch(url, {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to get schema version on ${nodeName}: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        if (data.errors && data.errors.length > 0) {
          throw new Error(
            `Failed to get schema version on ${nodeName}: ${data.errors
              .map((error: any) => error.message)
              .join(', ')}`
          );
        }

        console.log(`Schema version retrieved successfully on ${nodeName}.`);
        return data.data;
      })
    );

    if (results.every(Boolean)) {
      return NextResponse.json({ success: true, results });
    }

    return NextResponse.json(
      { error: 'Failed to get schema version on all nodes' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error(`Error getting schema version: ${error.message}`);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
