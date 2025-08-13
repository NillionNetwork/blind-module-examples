import { useState } from 'react';
import { ApiKeyRecord } from '@/lib/types';

interface RecordItemProps {
  record: ApiKeyRecord;
  onUpdate: (record: ApiKeyRecord) => void;
  onDelete: (service: string) => void;
  loading: boolean;
}

export default function RecordItem({ record, onUpdate, onDelete, loading }: RecordItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ApiKeyRecord>(record);

  const handleSave = () => {
    onUpdate(editingRecord);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingRecord(record);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditingRecord(record);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="border border-gray-200 rounded p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={editingRecord.service}
              onChange={(e) => setEditingRecord({...editingRecord, service: e.target.value})}
              className="border border-gray-300 px-3 py-2 rounded"
            />
            <input
              type="text"
              value={editingRecord.username}
              onChange={(e) => setEditingRecord({...editingRecord, username: e.target.value})}
              className="border border-gray-300 px-3 py-2 rounded"
            />
            <input
              type="text"
              value={editingRecord.apiKey?.['%allot'] || ''}
              onChange={(e) => setEditingRecord({
                ...editingRecord, 
                apiKey: { '%allot': e.target.value }
              })}
              className="border border-gray-300 px-3 py-2 rounded"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded p-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-lg">{record.service}</div>
          <div className="text-gray-600">Username: {record.username}</div>
          <div className="text-sm text-gray-500 font-mono">
            API Key: {record.apiKey?.['%allot'] || record.apiKey || 'N/A'}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(record.service)}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}