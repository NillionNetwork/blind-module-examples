import React, { useEffect, useState } from 'react';
import { Keypair } from '@nillion/nuc';
import { SecretVaultBuilderClient } from '@nillion/secretvaults';

const NILLION_API_KEY = process.env.REACT_APP_NILLION_API_KEY || '';
const NILLION_COLLECTION_ID = process.env.REACT_APP_NILLION_COLLECTION_ID || '';

function App() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readCollection = async () => {
    setLoading(true);
    setError(null);

    try {
      // get a Nillion API Key: https://docs.nillion.com/build/network-api-access
      // see Nillion Testnet Config: https://docs.nillion.com/build/network-config#nildb-nodes
      const builder = await SecretVaultBuilderClient.from({
        keypair: Keypair.from(NILLION_API_KEY),
        urls: {
          chain: 'http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz',
          auth: 'https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz',
          dbs: [
            'https://nildb-stg-n1.nillion.network',
            'https://nildb-stg-n2.nillion.network',
            'https://nildb-stg-n3.nillion.network',
          ],
        },
        blindfold: { operation: 'store' },
      });

      await builder.refreshRootToken();
      const response = await builder.findData({
        collection: NILLION_COLLECTION_ID,
        filter: {},
      });

      setData(response.data);
    } catch (err) {
      setError((err as Error).message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      NILLION_API_KEY &&
      NILLION_COLLECTION_ID &&
      NILLION_API_KEY !== 'your-api-key-here' &&
      NILLION_COLLECTION_ID !== 'your-collection-id-here'
    ) {
      readCollection();
    }
  }, []);

  if (
    !NILLION_API_KEY ||
    !NILLION_COLLECTION_ID ||
    NILLION_API_KEY === 'your-api-key-here' ||
    NILLION_COLLECTION_ID === 'your-collection-id-here'
  ) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h1>⚠️ Environment Variables Missing</h1>
        <p>Create a .env file in your project root:</p>
        <pre style={{ background: '#f5f5f5', padding: '1rem' }}>
          {`REACT_APP_NILLION_API_KEY=your-api-key-here
REACT_APP_NILLION_COLLECTION_ID=your-collection-id-here`}
        </pre>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>React: Nillion Collection Reader</h1>
      <p>Reading all records in your Nillion Private Storage collection</p>

      <button onClick={readCollection} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh Data'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>Error: {error}</div>
      )}

      <div style={{ marginTop: '20px' }}>
        <p>Found {data.length} records:</p>
        <pre style={{ background: '#f5f5f5', padding: '10px' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App;
