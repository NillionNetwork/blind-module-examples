import { useState } from 'react';

interface AddRecordFormProps {
  onAddRecord: (record: { service: string; username: string; apiKey: string }) => void;
  loading: boolean;
}

export default function AddRecordForm({ onAddRecord, loading }: AddRecordFormProps) {
  const [newRecord, setNewRecord] = useState({
    service: '',
    username: '',
    apiKey: ''
  });

  const handleSubmit = () => {
    if (!newRecord.service || !newRecord.username || !newRecord.apiKey) return;
    
    onAddRecord(newRecord);
    setNewRecord({ service: '', username: '', apiKey: '' });
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Add New API Key</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Service (e.g., GitHub)"
          value={newRecord.service}
          onChange={(e) => setNewRecord(prev => ({ ...prev, service: e.target.value }))}
          className="border border-gray-300 px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Username"
          value={newRecord.username}
          onChange={(e) => setNewRecord(prev => ({ ...prev, username: e.target.value }))}
          className="border border-gray-300 px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="API Key"
          value={newRecord.apiKey}
          onChange={(e) => setNewRecord(prev => ({ ...prev, apiKey: e.target.value }))}
          className="border border-gray-300 px-3 py-2 rounded"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading || !newRecord.service || !newRecord.username || !newRecord.apiKey}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Add API Key
      </button>
    </div>
  );
}