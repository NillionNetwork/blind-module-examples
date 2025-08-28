import { ApiKeyRecord } from '@/lib/types';
import RecordItem from './RecordItem';

interface RecordsListProps {
  records: ApiKeyRecord[];
  filterService: string;
  onFilterChange: (service: string) => void;
  onRefresh: () => void;
  onUpdateRecord: (record: ApiKeyRecord) => void;
  onDeleteRecord: (service: string) => void;
  loading: boolean;
}

export default function RecordsList({
  records,
  filterService,
  onFilterChange,
  onRefresh,
  onUpdateRecord,
  onDeleteRecord,
  loading
}: RecordsListProps) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">API Keys ({records.length})</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Filter by service"
            value={filterService}
            onChange={(e) => onFilterChange(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          />
          <button
            onClick={onRefresh}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {records.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No API keys found</p>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <RecordItem
              key={record._id}
              record={record}
              onUpdate={onUpdateRecord}
              onDelete={onDeleteRecord}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
}