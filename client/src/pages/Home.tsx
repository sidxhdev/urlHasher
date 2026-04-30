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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 text-gray-900">URL Hasher</h1>
          <p className="text-base md:text-lg text-gray-600">Shorten and track your URLs</p>
        </div>

        <URLInput onURLCreated={handleURLCreated} />

        <div className="my-8 md:my-12" />

        <URLTable refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
