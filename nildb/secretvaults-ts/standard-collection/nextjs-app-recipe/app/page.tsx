'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/read-collection');
      const result = await res.json();

      if (result.success) {
        setData(result.data || []);
      } else {
        setError(result.error || 'Failed to load data');
      }
    } catch (err) {
      setError((err as Error).message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error && error.includes('Missing required environment variables')) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h1>⚠️ Environment Variables Missing</h1>
        <p>Create a .env.local file in your project root:</p>
        <pre style={{ background: '#f5f5f5', padding: '1rem' }}>
          {`NILLION_API_KEY=your-api-key-here
NILLION_COLLECTION_ID=your-collection-id-here`}
        </pre>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Nillion Collection Reader</h1>
      <p>Reading all records in your Nillion Private Storage collection</p>

      <button onClick={fetchData} disabled={loading}>
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