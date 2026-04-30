import { useState } from 'react';
import URLInput from '../components/URLInput';
import URLTable from '../components/URLTable';
import type { CreateURLResponse } from '../services/api';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleURLCreated = (response: CreateURLResponse) => {
    console.log('New shortened URL:', response);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center pb-10 border-b-2 border-gray-200 mb-10">
        <h1 className="text-5xl font-bold mb-2 text-gray-900">URL Hasher</h1>
        <p className="text-xl text-gray-600">Shorten your long URLs and track their clicks</p>
      </div>

      <URLInput onURLCreated={handleURLCreated} />

      <div key={refreshTrigger} className="my-10 border-t border-gray-300" />

      <URLTable />
    </div>
  );
}
