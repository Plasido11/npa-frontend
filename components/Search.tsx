// src/components/Search.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setQuery(searchTerm);

    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    // Call the custom Postgres function using Supabase RPC
    const { data, error } = await supabase
      .rpc('search_conditions', { search_term: searchTerm });

    if (!error && data) {
      setResults(data);
    }
  };

  return (
    <div className="mb-8 w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search conditions (try typing 'stoke')..."
        className="w-full p-3 border rounded shadow-sm text-black"
      />
      
      {results.length > 0 && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="text-sm font-bold text-gray-500 mb-2">SEARCH RESULTS</h3>
          {results.map((item) => (
            <div key={item.id} className="mb-2">
              <span className="font-semibold text-blue-600">{item.title}</span>
              <p className="text-xs text-gray-600">Matches: {item.aliases}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
