// import { NextRequest, NextResponse } from 'next/server';
// import { createEncryptionService } from '../../../lib/encryption';
// import { nilql } from '@nillion/nilql';
// import { NODE_CONFIG, SCHEMA_ID } from '../../../lib/config';

// // Define the Credential type for validation
// type Credential = {
//   username: string;
//   password: string;
//   service: string;
// };

// // Helper function to validate credential data
// const isValidCredential = (data: any): data is Credential => {
//   return (
//     typeof data.username === 'string' &&
//     data.username.trim().length > 0 &&
//     typeof data.password === 'string' &&
//     data.password.trim().length > 0 &&
//     typeof data.service === 'string' &&
//     data.service.trim().length > 0
//   );
// };

// export async function POST(request: NextRequest) {
//   try {
//     // Parse and validate the input
//     const body = await request.json();
//     if (!isValidCredential(body)) {
//       return NextResponse.json(
//         {
//           error:
//             'Invalid input: ensure username, password, and service are provided',
//         },
//         { status: 400 }
//       );
//     }

//     const { username, password, service } = body;

//     // Initialize the encryption service
//     const encryptionService = await createEncryptionService({
//       nodes: 3,
//       operations: { store: true },
//     });

//     // Encrypt the password
//     const shares = await encryptionService.encryptPassword(password);

//     // Preparing data for storage
//     const dataToStore = {
//       username,
//       service,
//       shares,
//       timestamp: new Date().toISOString(),
//     };

//     // Share among nodes - assuming a custom function is used to handle POST requests
//     const responses = await Promise.all(
//       [NODE_CONFIG.node_a, NODE_CONFIG.node_b, NODE_CONFIG.node_c].map((node) =>
//         fetch(`${node.url}/store`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${node.jwt}`,
//           },
//           body: JSON.stringify({
//             schemaId: SCHEMA_ID,
//             data: dataToStore,
//           }),
//         })
//       )
//     );

//     const errors = responses.filter((response) => !response.ok);

//     if (errors.length) {
//       throw new Error('Failed to store credential in one or more nodes');
//     }

//     return NextResponse.json(
//       { message: 'Credential stored successfully' },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error('Error storing credential:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

// app/api/nildb/credentials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createEncryptionService } from '../../../lib/encryption';
import { NODE_CONFIG, SCHEMA_ID } from '../../../lib/config';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting POST request handling...');

    // Hardcoded credential values
    const hardcodedData = {
      username: 'hardcodedUser',
      password: 'superSecret123',
      service: 'testService',
    };

    console.log('Creating encryption service...');

    // Initialize the encryption service
    const encryptionService = await createEncryptionService({
      nodes: 3, // Set per the number of nodes
      operations: { store: true },
    });

    console.log('Encrypting password...');
    const shares = await encryptionService.encryptPassword(
      hardcodedData.password
    );
    console.log('Encryption completed:', shares);

    // Prepare the data to store per node
    const dataToStore = {
      username: hardcodedData.username,
      service: hardcodedData.service,
      shares,
      timestamp: new Date().toISOString(),
    };

    console.log('Data prepared for storage:', dataToStore);

    // Distribute encrypted shares to cluster nodes with error highlighting
    const responses = await Promise.all(
      Object.entries(NODE_CONFIG).map(async ([nodeName, node], index) => {
        try {
          const response = await fetch(`${node.url}/store`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${node.jwt}`,
            },
            body: JSON.stringify({
              data: {
                ...dataToStore,
                share: shares[index], // Associate each share with a node
              },
            }),
          });

          const responseData = await response.text();
          console.log(`Response from ${nodeName} (${node.url}):`, {
            status: response.status,
            responseData,
          });

          if (!response.ok) {
            console.error(`Error response from ${nodeName}:`, responseData);
          }

          return response;
        } catch (error) {
          console.error(
            `Error contacting node ${nodeName} at ${node.url}:`,
            error
          );
          return { ok: false } as Response;
        }
      })
    );

    const errors = responses.filter((response) => !response.ok);

    if (errors.length) {
      throw new Error('Failed to store credential in one or more nodes');
    }

    // Success response
    return NextResponse.json(
      { message: 'Credential stored successfully', data: dataToStore },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error storing credential:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
