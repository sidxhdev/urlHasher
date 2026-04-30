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
    <div className="min-h-screen bg-gray-50 px-4 md:px-0">
      <div className="max-w-5xl mx-auto py-6 md:py-8">
        <div className="text-center pb-6 md:pb-10 border-b-2 border-gray-200 mb-6 md:mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 text-gray-900">URL Hasher</h1>
          <p className="text-base md:text-xl text-gray-600">Shorten your long URLs and track their clicks</p>
        </div>

        <URLInput onURLCreated={handleURLCreated} />

        <div key={refreshTrigger} className="my-6 md:my-10 border-t border-gray-300" />

        <URLTable />
      </div>
    </div>
  );
}
