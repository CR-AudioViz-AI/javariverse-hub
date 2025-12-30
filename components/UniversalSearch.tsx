'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, ExternalLink, Filter } from 'lucide-react';

interface SearchResult {
  id: string;
  module: string;
  moduleName: string;
  moduleIcon: string;
  moduleUrl: string;
  title: string;
  description: string;
  thumbnail: string | null;
  metadata: Record<string, any>;
  relevance: number;
}

interface ModuleInfo {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface UniversalSearchProps {
  userId?: string;
  placeholder?: string;
  className?: string;
  onResultClick?: (result: SearchResult) => void;
  defaultModules?: string[];
}

export function UniversalSearch({
  userId,
  placeholder = 'Search across all apps...',
  className = '',
  onResultClick,
  defaultModules
}: UniversalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>(defaultModules || []);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '20'
      });
      
      if (userId) params.append('userId', userId);
      if (selectedModules.length > 0) {
        params.append('modules', selectedModules.join(','));
      }

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (res.ok) {
        setResults(data.results || []);
        setModules(data.modules || []);
        setTotal(data.total || 0);
      } else {
        console.error('Search error:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedModules]);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      // Default: open in new tab
      const url = `${result.moduleUrl}/${result.id}`;
      window.open(url, '_blank');
    }
    setShowResults(false);
  };

  // Toggle module filter
  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded ${showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'}`}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && modules.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <p className="text-xs text-gray-500 mb-2">Filter by module:</p>
          <div className="flex flex-wrap gap-2">
            {modules.map(module => (
              <button
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 transition-colors ${
                  selectedModules.length === 0 || selectedModules.includes(module.id)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                <span>{module.icon}</span>
                <span>{module.name}</span>
                {module.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded-full text-xs">
                    {module.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Dropdown */}
      {showResults && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-40 max-h-[400px] overflow-y-auto">
          {results.length > 0 ? (
            <>
              <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500">
                  {total} result{total !== 1 ? 's' : ''} found
                </p>
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {results.map((result, index) => (
                  <li key={`${result.module}-${result.id}-${index}`}>
                    <button
                      onClick={() => handleResultClick(result)}
                      className="w-full p-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                    >
                      {/* Thumbnail or Icon */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {result.thumbnail ? (
                          <img 
                            src={result.thumbnail} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">{result.moduleIcon}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                            {result.moduleIcon} {result.moduleName}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white truncate mt-1">
                          {result.title}
                        </h4>
                        {result.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {result.description}
                          </p>
                        )}
                      </div>

                      {/* External Link Icon */}
                      <ExternalLink className="flex-shrink-0 h-4 w-4 text-gray-400" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : query.length >= 2 && !loading ? (
            <div className="p-6 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords or filters</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Compact search for navbar
export function NavbarSearch({ userId }: { userId?: string }) {
  return (
    <UniversalSearch 
      userId={userId}
      placeholder="Search..."
      className="w-64"
    />
  );
}

// Full-page search component
export function SearchPage({ userId }: { userId?: string }) {
  const [results, setResults] = useState<SearchResult[]>([]);
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Search Everything</h1>
      <UniversalSearch 
        userId={userId}
        placeholder="Search across all CR AudioViz AI apps..."
        className="mb-8"
        onResultClick={(result) => {
          window.location.href = `${result.moduleUrl}/${result.id}`;
        }}
      />
    </div>
  );
}

export default UniversalSearch;
