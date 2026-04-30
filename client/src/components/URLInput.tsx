import { useState } from 'react';
import { apiService, CreateURLResponse } from '../services/api';

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
    <div className="bg-white p-10 rounded-lg shadow-md mb-10">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Shorten Your URL</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={loading}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </div>

        {error && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm">{error}</div>}
        {success && <div className="p-3 bg-green-100 text-green-700 border border-green-300 rounded-lg text-sm">{success}</div>}
      </form>
    </div>
  );
}
