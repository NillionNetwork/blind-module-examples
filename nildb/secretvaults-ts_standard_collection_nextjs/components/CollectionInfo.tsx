interface CollectionInfoProps {
  collectionId: string;
  metadata: any;
  onRefreshMetadata: () => void;
}

export default function CollectionInfo({ 
  collectionId, 
  metadata, 
  onRefreshMetadata 
}: CollectionInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
        <div className="font-semibold mb-2">Collection Info</div>
        <div>ID: <code className="font-mono text-sm">{collectionId}</code></div>
      </div>
      
      {metadata && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          <div className="font-semibold mb-2">Metadata</div>
          <div className="text-sm space-y-1">
            <div>Records: {metadata.totalRecords}</div>
            <div>Size: {metadata.sizeBytes} bytes</div>
            <div>Modified: {new Date(metadata.lastModified).toLocaleDateString()}</div>
          </div>
          <button
            onClick={onRefreshMetadata}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Refresh Metadata
          </button>
        </div>
      )}
    </div>
  );
}