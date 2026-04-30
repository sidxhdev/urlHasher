import { useState } from 'react';
import { apiService } from '../services/api';
import type { CreateURLResponse } from '../services/api';

interface URLInputProps {
  onURLCreated: (response: CreateURLResponse) => void;
}

export default function URLInput({ onURLCreated }: URLInputProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.shortenURL(url);
      setSuccess('URL shortened successfully!');
      onURLCreated(response);
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Shorten Your URL</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your long URL here..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition text-sm md:text-base"
            disabled={loading}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all text-sm md:text-base whitespace-nowrap"
            disabled={loading}
          >
            {loading ? 'Shortening...' : 'Shorten'}
          </button>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded text-sm">{error}</div>}
        {success && <div className="p-3 bg-green-50 text-green-700 border-l-4 border-green-500 rounded text-sm">{success}</div>}
      </form>
    </div>
  );
}
