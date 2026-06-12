'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SearchResultTable from '@/components/SearchResultTable';

export default function SearchPage() {
  const { status } = useSession();
  
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  if (status === 'loading' || status === 'unauthenticated') {
    return null;
  }

  const examples = [
    "What's for lunch today?",
    "Upcoming IMG events",
    "My courses this semester",
    "Available books on ML"
  ];

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    // Save to recent searches (keep last 3 unique)
    setRecentSearches(prev => {
      const newRecents = [q, ...prev.filter(item => item !== q)].slice(0, 3);
      return newRecents;
    });
    setQuery(q); // update input if clicked from chip

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col pt-20 px-4">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto w-full text-center space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">What would you like to know?</h1>
            <p className="text-sm text-gray-500">Ask anything about the campus</p>
          </div>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Is Clean Code available in the library?"
              className="w-full py-3 px-6 text-base text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {examples.map(ex => (
              <button
                key={ex}
                onClick={() => handleSearch(ex)}
                className="px-4 py-2 rounded-full bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>

          {recentSearches.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 items-center mt-2">
              <span className="text-xs text-gray-400 font-medium">Recent:</span>
              {recentSearches.map((rec, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(rec)}
                  className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs hover:bg-gray-200 transition-colors"
                >
                  {rec}
                </button>
              ))}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
            >
              Search
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="w-full pb-12">
          {isLoading && (
            <div className="mt-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in">
              <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-green-700">Searching campus data...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="mt-8 max-w-2xl mx-auto w-full bg-red-50 border border-red-200 rounded-xl p-6 text-center animate-in fade-in">
              <p className="text-red-600 font-medium mb-3">{error}</p>
              <button 
                onClick={() => handleSearch()}
                className="text-sm font-medium text-red-700 underline hover:text-red-800"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !error && result && (
            <SearchResultTable result={result} />
          )}
        </div>
      </main>
    </div>
  );
}