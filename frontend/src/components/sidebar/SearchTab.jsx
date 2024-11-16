// src/components/sidebar/SearchTab.jsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchTab = ({ entries, onOpenEntry }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('fulltext');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const entriesArray = Array.isArray(entries) ? entries : Array.from(entries.values());
    
    const results = entriesArray.filter(entry => {
      if (!entry) return false;
      
      const matchText = entry.content?.toLowerCase().includes(query);
      const matchTags = Array.isArray(entry.tags) && entry.tags.some(tag => 
        tag?.toLowerCase().includes(query)
      );

      switch (searchType) {
        case 'fulltext':
          return matchText;
        case 'tags':
          return matchTags;
        case 'all':
        default:
          return matchText || matchTags;
      }
    });

    setSearchResults(results);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search entries..."
            className="flex-1 px-3 py-2 bg-background dark:bg-background-dark 
                     border border-border dark:border-border-dark rounded"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-2 bg-primary dark:bg-primary-dark hover:bg-primary-hover 
                     dark:hover:bg-primary-dark-hover text-white rounded transition-smooth"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="searchType"
              value="fulltext"
              checked={searchType === 'fulltext'}
              onChange={(e) => setSearchType(e.target.value)}
            />
            <span>Full Text</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="searchType"
              value="tags"
              checked={searchType === 'tags'}
              onChange={(e) => setSearchType(e.target.value)}
            />
            <span>Tags</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="searchType"
              value="all"
              checked={searchType === 'all'}
              onChange={(e) => setSearchType(e.target.value)}
            />
            <span>All</span>
          </label>
        </div>
      </div>

      <div className="mt-4">
        {searchResults.map((entry) => (
          <div
            key={entry.id}
            onClick={() => onOpenEntry(entry)}
            className="p-2 hover:bg-secondary dark:hover:bg-secondary-dark 
                     rounded cursor-pointer transition-smooth"
          >
            <div className="font-medium">{entry.title}</div>
            <div className="text-sm text-text-muted dark:text-text-muted-dark">
              {new Date(entry.created).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchTab;