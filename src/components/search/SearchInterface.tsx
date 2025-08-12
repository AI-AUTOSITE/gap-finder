// src/components/search/SearchInterface.tsx
'use client';

import { useState, useEffect } from 'react';
import { Target, Wifi, WifiOff, Download, Info, ChevronDown } from 'lucide-react';
import { SearchBox } from './SearchBox';
import { CategoryFilter } from './CategoryFilter';
import { SearchEngine, initSearchEngineFromJSON } from '@/lib/search/searchEngine';
import type { SearchResult, CompetitorData } from '@/types';

export function SearchInterface() {
  const [searchEngine, setSearchEngine] = useState<SearchEngine | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [smartSearchResults, setSmartSearchResults] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'results' | 'gaps' | 'strategies'>('results');
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  // Initialize search engine
  useEffect(() => {
    async function init() {
      try {
        const engine = await initSearchEngineFromJSON('/data/competitors.json');
        setSearchEngine(engine);
        setCategories(engine.getAllCategories());
        
        // Set initial popular tools
        const popularTools = engine.getPopularTools(6);
        setSearchResults(popularTools.map(tool => ({
          tool,
          score: 1,
          matchedKeywords: [],
          matchType: 'exact' as const
        })));
      } catch (error) {
        console.error('Failed to initialize search engine:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    init();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle category selection
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    
    if (searchEngine) {
      if (category) {
        const results = searchEngine.searchByCategory(category);
        setSearchResults(results);
        setSmartSearchResults(null);
      } else {
        // Reset to popular tools
        const popularTools = searchEngine.getPopularTools(6);
        setSearchResults(popularTools.map(tool => ({
          tool,
          score: 1,
          matchedKeywords: [],
          matchType: 'exact' as const
        })));
      }
    }
  };

  // Handle search
  const handleSearch = (results: SearchResult[]) => {
    setSearchResults(results);
    setSmartSearchResults(null);
    setSelectedCategory(null);
  };

  // Handle smart search
  const handleSmartSearch = (results: any) => {
    setSmartSearchResults(results);
    setSearchResults(results.directMatches);
    setSelectedCategory(null);
  };

  // Toggle tool expansion
  const toggleToolExpansion = (toolId: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedTools(newExpanded);
  };

  // Calculate tool counts per category
  const toolCounts = searchResults.reduce((acc, result) => {
    const category = result.tool.category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading competitor database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gap Finder</h1>
                <p className="text-xs text-gray-600">Smart Competitor Analysis</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Online/Offline Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                {isOnline ? 'Online' : 'Offline Mode'}
              </div>
              
              {/* Export Button */}
              <button className="btn-secondary btn-sm flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              {/* Pro Button */}
              <button className="btn-primary btn-sm">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Search */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Competitive Edge
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover market gaps by analyzing competitors + similar tools. 
            Get actionable insights powered by AI. Works offline.
          </p>
          
          {searchEngine && (
            <SearchBox 
              searchEngine={searchEngine}
              onSearch={handleSearch}
              onSmartSearch={handleSmartSearch}
            />
          )}
        </div>

        {/* Category Filter */}
        {searchEngine && (
          <div className="mb-8">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              toolCounts={toolCounts}
            />
          </div>
        )}

        {/* Results Section */}
        {searchResults.length > 0 && (
          <div className="mt-8">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedCategory 
                  ? `${selectedCategory} Tools` 
                  : smartSearchResults 
                    ? 'Smart Search Results'
                    : 'Search Results'
                }
              </h3>
              <span className="text-sm text-gray-600">
                {searchResults.length} tools found
              </span>
            </div>

            {/* Smart Search Tabs (if smart search active) */}
            {smartSearchResults && (
              <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'results'
                        ? 'border-brand-500 text-brand-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Direct Matches ({smartSearchResults.directMatches.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('gaps')}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'gaps'
                        ? 'border-brand-500 text-brand-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Market Gaps ({smartSearchResults.opportunities.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('strategies')}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'strategies'
                        ? 'border-brand-500 text-brand-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Similar Tools ({smartSearchResults.similarTools.length})
                  </button>
                </nav>
              </div>
            )}

            {/* Results Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((result) => (
                <CompetitorCard
                  key={result.tool.id}
                  result={result}
                  isExpanded={expandedTools.has(result.tool.id)}
                  onToggleExpand={() => toggleToolExpansion(result.tool.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tools found
            </h3>
            <p className="text-gray-600">
              Try searching for something else or browse by category
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// Competitor Card Component
function CompetitorCard({ 
  result, 
  isExpanded, 
  onToggleExpand 
}: { 
  result: SearchResult;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const { tool } = result;
  
  // Get top complaint severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  return (
    <div className="card hover:shadow-xl transition-all duration-200">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{tool.name}</h3>
          <p className="text-sm text-gray-600">{tool.category}</p>
          <p className="text-sm text-brand-600 font-medium mt-1">{tool.pricing}</p>
        </div>
        {tool.marketShare && (
          <span className="badge badge-info">
            {tool.marketShare} market share
          </span>
        )}
      </div>

      {/* Top Complaints */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Top User Complaints</h4>
        <div className="space-y-2">
          {tool.userComplaints.slice(0, isExpanded ? 5 : 2).map((complaint, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(complaint.severity)}`}>
                {complaint.frequency}%
              </span>
              <p className="text-sm text-gray-600 flex-1">{complaint.issue}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Opportunity */}
      {tool.industryGaps.length > 0 && (
        <div className="p-3 bg-green-50 rounded-lg mb-4">
          <p className="text-sm font-semibold text-green-700 mb-1">
            💡 Opportunity: {tool.industryGaps[0].gap}
          </p>
          {isExpanded && (
            <p className="text-xs text-green-600 mt-1">
              {tool.industryGaps[0].opportunity}
            </p>
          )}
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t pt-4 space-y-3">
          {/* Similar Tools */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Similar Tools</h4>
            <div className="flex flex-wrap gap-2">
              {tool.similarTools.slice(0, 3).map((similar) => (
                <span key={similar.id} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                  {similar.name}
                </span>
              ))}
            </div>
          </div>

          {/* Action Strategy */}
          {tool.actionStrategies.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-1">Strategy</h4>
              <p className="text-xs text-gray-600">{tool.actionStrategies[0].description}</p>
            </div>
          )}
        </div>
      )}

      {/* Expand/Collapse Button */}
      <button
        onClick={onToggleExpand}
        className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
      >
        {isExpanded ? 'Show Less' : 'Show More'}
        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}