import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { URL } from '../services/api';

export default function URLTable() {
  const [urls, setUrls] = useState<URL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchURLs();
  }, []);

  const fetchURLs = async () => {
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
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

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
    <div className="bg-white p-10 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Recent URLs</h2>
        <button
          onClick={fetchURLs}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-10 text-gray-600">Loading URLs...</div>
      ) : urls.length === 0 ? (
        <div className="text-center py-10 text-gray-600">No URLs created yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-800">Sr. No</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-800">Creation Time</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-800">Original URL</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-800">Short URL</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-800">Clicks</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-800">Action</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{index + 1}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(item.creation_date)}</td>
                  <td className="px-4 py-3 max-w-sm" title={item.original_url}>
                    <a
                      href={item.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-words"
                    >
                      {item.original_url.length > 40
                        ? item.original_url.substring(0, 40) + '...'
                        : item.original_url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <code className="bg-gray-100 px-2 py-1 rounded text-gray-800 font-mono text-xs">
                      {item.short_url}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item.click_count}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/redirect/${item.short_url}`)}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-semibold hover:bg-gray-700 transition-colors"
                      title="Copy full short URL"
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
