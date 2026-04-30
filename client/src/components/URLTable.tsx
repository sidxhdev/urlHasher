import { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { URL } from '../services/api';

interface URLTableProps {
  refreshTrigger?: number;
}

export default function URLTable({ refreshTrigger = 0 }: URLTableProps) {
  const [urls, setUrls] = useState<URL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchURLs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getAllURLs();
      setUrls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchURLs();
  }, [fetchURLs, refreshTrigger]);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Copied to clipboard!');
      }
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Failed to copy. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Recent URLs</h2>
        <button
          onClick={fetchURLs}
          className="px-4 py-2  from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all text-sm"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded text-sm">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Loading URLs...</p>
        </div>
      ) : urls.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500 text-lg">No URLs shortened yet. Create one to get started!</p>
        </div>
      ) : (
        <>
          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-3">
            {urls.map((item, index) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  <span className="text-xs text-gray-500">{new Date(item.creation_date).toLocaleDateString()}</span>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">Original:</p>
                  <a
                    href={item.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-words text-sm"
                  >
                    {item.original_url.substring(0, 50)}
                    {item.original_url.length > 50 && '...'}
                  </a>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">Short Code:</p>
                  <div className="flex justify-between items-center">
                    <code className="bg-gray-100 px-3 py-2 rounded font-mono text-sm font-bold text-gray-800">
                      {item.short_url}
                    </code>
                    <span className="text-xs text-gray-600">{item.click_count} clicks</span>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/redirect/${item.short_url}`)}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition text-sm"
                >
                  Copy Link
                </button>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Sr.</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Created</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Original URL</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Short Code</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Clicks</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {urls.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-700 font-semibold">{index + 1}</td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {new Date(item.creation_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <a
                        href={item.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-words"
                        title={item.original_url}
                      >
                        {item.original_url.substring(0, 40)}
                        {item.original_url.length > 40 && '...'}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <code className="bg-gray-100 px-3 py-1 rounded font-mono font-bold text-gray-800">
                        {item.short_url}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.click_count}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/redirect/${item.short_url}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition text-xs whitespace-nowrap"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
