'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiKeyRecord, ApiResponse } from '@/lib/types';
import CollectionInfo from '@/components/CollectionInfo';
import AddRecordForm from '@/components/AddRecordForm';
import RecordsList from '@/components/RecordsList';

export default function Home() {
  const [collectionId, setCollectionId] = useState<string>('');
  const [records, setRecords] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [filterService, setFilterService] = useState('');
  const [metadata, setMetadata] = useState<any>(null);

  const createCollection = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/createCollection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'API Keys Collection' })
      });
      
      const result: ApiResponse = await response.json();
      if (result.success) {
        setCollectionId(result.data.collectionId);
        await addSampleRecords(result.data.collectionId);
        await getMetadata(result.data.collectionId);
      } else {
        setError(result.error || 'Failed to create collection');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addSampleRecords = async (id: string) => {
    const sampleData = [
      { service: 'GitHub', username: 'company-bot', apiKey: 'ghp_1234567890abcdef' },
      { service: 'Stripe', username: 'payments', apiKey: 'sk_live_1234567890abcdef' },
      { service: 'OpenAI', username: 'ai-team', apiKey: 'sk-proj-1234567890abcdef' },
    ];

    try {
      const response = await fetch('/api/writeRecord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: id, records: sampleData })
      });
      
      const result: ApiResponse = await response.json();
      if (result.success) {
        await fetchRecords(id);
        await getMetadata(id);
      }
    } catch (err) {
      console.error('Failed to add sample records:', err);
    }
  };

  const fetchRecords = useCallback(async (id?: string) => {
    const targetId = id || collectionId;
    if (!targetId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ collectionId: targetId });
      if (filterService) {
        params.set('service', filterService);
      }
      
      const response = await fetch(`/api/readRecord?${params}`);
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setRecords(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch records');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [collectionId, filterService]);

  const addRecord = async (newRecord: { service: string; username: string; apiKey: string }) => {
    if (!collectionId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/writeRecord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId, records: [newRecord] })
      });
      
      const result: ApiResponse = await response.json();
      if (result.success) {
        await fetchRecords();
        await getMetadata();
      } else {
        setError(result.error || 'Failed to add record');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (service: string) => {
    if (!collectionId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        collectionId, 
        service 
      });
      
      const response = await fetch(`/api/deleteRecord?${params}`, {
        method: 'DELETE'
      });
      
      const result: ApiResponse = await response.json();
      if (result.success) {
        await fetchRecords();
        await getMetadata();
      } else {
        setError(result.error || 'Failed to delete record');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getMetadata = async (id?: string) => {
    const targetId = id || collectionId;
    if (!targetId) return;

    try {
      const response = await fetch(`/api/getMetadata?collectionId=${targetId}`);
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setMetadata(result.data);
      }
    } catch (err) {
      console.error('Failed to get metadata:', err);
    }
  };

  const updateRecord = async (record: ApiKeyRecord) => {
    if (!collectionId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/updateRecord', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId,
          filter: { _id: record._id },
          update: {
            $set: {
              service: record.service,
              username: record.username,
              apiKey: { '%allot': record.apiKey['%allot'] },
            }
          }
        })
      });
      
      const result: ApiResponse = await response.json();
      if (result.success) {
        await fetchRecords();
        await getMetadata();
      } else {
        setError(result.error || 'Failed to update record');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchRecords();
    await getMetadata();
  };

  useEffect(() => {
    if (collectionId && filterService !== undefined) {
      fetchRecords();
    }
  }, [collectionId, filterService, fetchRecords]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Nillion SecretVault - API Keys Manager
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!collectionId ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <button
                onClick={createCollection}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded font-medium disabled:opacity-50"
              >
                {loading ? 'Creating Collection...' : 'Create API Keys Collection'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <CollectionInfo
              collectionId={collectionId}
              metadata={metadata}
              onRefreshMetadata={getMetadata}
            />

            <AddRecordForm
              onAddRecord={addRecord}
              loading={loading}
            />

            <RecordsList
              records={records}
              filterService={filterService}
              onFilterChange={setFilterService}
              onRefresh={handleRefresh}
              onUpdateRecord={updateRecord}
              onDeleteRecord={deleteRecord}
              loading={loading}
            />
          </div>
        )}
      </div>
    </main>
  );
}