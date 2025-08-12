export default function AuthMethodsComparison() {
  return (
    <div className='mt-16 p-8 rounded-2xl bg-white shadow-sm max-w-4xl mx-auto'>
      <h3 className='text-xl font-bold mb-8 text-black text-center'>
        Authentication Methods Comparison
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='text-center p-6 rounded-xl bg-gray-50'>
          <h4 className='font-bold text-black mb-4 text-lg'>Direct API Key</h4>
          <ul className='space-y-2 text-gray-700 text-sm'>
            <li>• Simple implementation</li>
            <li>• Direct authentication</li>
            <li>• Good for server-side applications</li>
            <li>• API key exposed to client requests</li>
          </ul>
        </div>
        <div className='text-center p-6 rounded-xl bg-gray-50'>
          <h4 className='font-bold text-black mb-4 text-lg'>
            Delegation Token
          </h4>
          <ul className='space-y-2 text-gray-700 text-sm'>
            <li>• Enhanced security</li>
            <li>• Time-limited tokens</li>
            <li>• Single-use tokens</li>
            <li>• API key remains on server</li>
          </ul>
        </div>
      </div>
    </div>
  );
}