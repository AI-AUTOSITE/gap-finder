// src/components/search/SearchBox.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, TrendingUp, Sparkles, Clock, Filter } from 'lucide-react';
import { SearchEngine } from '@/lib/search/searchEngine';
import type { SearchResult } from '@/types';

interface SearchBoxProps {
  searchEngine: SearchEngine;
  onSearch: (results: SearchResult[]) => void;
  onSmartSearch?: (results: any) => void;
}

export function SearchBox({ searchEngine, onSearch, onSmartSearch }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState<'basic' | 'smart'>('smart');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setRecentSearches(JSON.parse(history).slice(0, 5));
    }
  }, []);

  // Get suggestions as user types
  useEffect(() => {
    if (query.length >= 2) {
      const newSuggestions = searchEngine.getSuggestions(query);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, searchEngine]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search
  const handleSearch = useCallback(async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      // Save to history
      const updatedHistory = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updatedHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

      // Perform search based on mode
      if (searchMode === 'smart' && onSmartSearch) {
        const results = searchEngine.smartSearch(searchQuery);
        onSmartSearch(results);
      } else {
        const results = searchEngine.searchWithSimilar(searchQuery);
        onSearch(results);
      }
    } finally {
      setIsSearching(false);
    }
  }, [query, searchMode, searchEngine, onSearch, onSmartSearch, recentSearches]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Popular searches
  const popularSearches = ['Canva', 'Notion', 'GitHub', 'Slack', 'ChatGPT', 'Figma'];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-gray-400 pointer-events-none" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
              if (e.key === 'Escape') {
                setShowSuggestions(false);
              }
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search tools or describe what you need (e.g., 'design tool', 'slow loading')"
            className="w-full pl-12 pr-32 py-4 text-lg border border-gray-300 rounded-2xl 
                     focus:ring-2 focus:ring-brand-500 focus:border-transparent 
                     shadow-lg hover:shadow-xl transition-shadow"
            disabled={isSearching}
          />

          {/* Clear button */}
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-28 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Search Mode Toggle */}
          <div className="absolute right-14 flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSearchMode('basic')}
              className={`p-1 rounded transition-colors ${
                searchMode === 'basic' 
                  ? 'bg-white text-brand-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Basic Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSearchMode('smart')}
              className={`p-1 rounded transition-colors ${
                searchMode === 'smart' 
                  ? 'bg-white text-brand-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Smart Search (AI)"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </div>

          {/* Search button */}
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || isSearching}
            className="absolute right-2 btn-primary btn-sm"
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span className="hidden sm:inline">Analyzing...</span>
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full mt-2 w-full bg-white border border-gray-200 
                     rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                SUGGESTIONS
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg 
                           transition-colors flex items-center gap-2"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 space-y-4">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Recent:
            </span>
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  handleSearch(term);
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 
                         rounded-full text-sm transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* Popular Searches */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Popular:
          </span>
          {popularSearches.map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                handleSearch(term);
              }}
              className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 
                       rounded-full text-sm transition-colors"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Search Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Quick filters:
          </span>
          <button
            onClick={() => handleSearch('free tools')}
            className="px-3 py-1 border border-gray-300 hover:bg-gray-50 text-gray-700 
                     rounded-full text-sm transition-colors"
          >
            Free Tools
          </button>
          <button
            onClick={() => handleSearch('offline capable')}
            className="px-3 py-1 border border-gray-300 hover:bg-gray-50 text-gray-700 
                     rounded-full text-sm transition-colors"
          >
            Works Offline
          </button>
          <button
            onClick={() => handleSearch('slow performance')}
            className="px-3 py-1 border border-gray-300 hover:bg-gray-50 text-gray-700 
                     rounded-full text-sm transition-colors"
          >
            Performance Issues
          </button>
          <button
            onClick={() => handleSearch('expensive')}
            className="px-3 py-1 border border-gray-300 hover:bg-gray-50 text-gray-700 
                     rounded-full text-sm transition-colors"
          >
            Too Expensive
          </button>
        </div>
      </div>

      {/* Search Mode Description */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {searchMode === 'smart' ? (
            <>
              <Sparkles className="inline h-4 w-4 text-brand-500 mr-1" />
              <span className="font-medium">Smart Search Active:</span> Finding tools + similar alternatives + market gaps
            </>
          ) : (
            <>
              <Search className="inline h-4 w-4 text-gray-500 mr-1" />
              <span className="font-medium">Basic Search:</span> Direct tool matching only
            </>
          )}
        </p>
      </div>
    </div>
  );
}