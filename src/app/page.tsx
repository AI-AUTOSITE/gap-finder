// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Target, Wifi, WifiOff, Download, TrendingUp, Users, Lightbulb } from 'lucide-react';

// 型定義（簡略版）
interface CompetitorData {
  id: string;
  name: string;
  category: string;
  website: string;
  pricing: string;
  marketShare?: string;
  keywords: string[];
  aliases: string[];
  userComplaints: Array<{
    issue: string;
    frequency: number;
    severity: 'high' | 'medium' | 'low';
    source: string;
  }>;
  industryGaps: Array<{
    gap: string;
    opportunity: string;
    difficulty: 'easy' | 'medium' | 'hard';
    potential: 'low' | 'medium' | 'high' | 'very high';
  }>;
  similarTools: Array<{
    id: string;
    name: string;
    pricing: string;
    strength: string;
    weakness: string;
  }>;
}

export default function Home() {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompetitorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // データ読み込み
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/competitors.json');
        const data = await response.json();
        setCompetitors(data.tools || []);
        setSearchResults(data.tools?.slice(0, 6) || []); // 最初は6個表示
      } catch (error) {
        console.error('Failed to load competitors:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // オンライン/オフライン監視
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 検索処理
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults(competitors.slice(0, 6));
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = competitors.filter(tool => 
      tool.name.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query) ||
      tool.keywords.some(k => k.toLowerCase().includes(query))
    );
    
    setSearchResults(filtered);
  };

  // カテゴリ取得
  const categories = Array.from(new Set(competitors.map(c => c.category)));

  // 人気検索
  const popularSearches = ['Canva', 'Figma', 'Notion', 'Slack', 'Zoom', 'GitHub'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
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
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                {isOnline ? 'Online' : 'Offline'}
              </div>
              
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Competitive Edge
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover market gaps by analyzing competitors + similar tools. 
            Get actionable insights powered by AI. Works offline.
          </p>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools or categories (e.g., 'design tool', 'notion')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-32 py-4 text-lg border border-gray-300 rounded-2xl 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-2 px-6 py-3 bg-blue-600 text-white rounded-xl 
                         font-medium hover:bg-blue-700 transition-colors"
              >
                Find Gaps
              </button>
            </div>

            {/* Popular Searches */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-gray-500">Popular searches:</span>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    setTimeout(handleSearch, 100);
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 
                           rounded-full text-sm transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchResults(competitors.slice(0, 6));
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !selectedCategory 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Tools
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSearchResults(competitors.filter(c => c.category === category));
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading competitor data...</p>
          </div>
        ) : (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedCategory ? `${selectedCategory} Tools` : 
               searchQuery ? `Results for "${searchQuery}"` : 'Popular Tools'}
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({searchResults.length} tools)
              </span>
            </h3>

            {searchResults.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tools found
                </h3>
                <p className="text-gray-600">
                  Try searching for something else or browse by category
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((tool) => (
                  <CompetitorCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry-Wide Analysis</h3>
            <p className="text-gray-600 text-sm">
              See 5+ similar tools at once. Discover patterns across the entire industry.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Strategic Insights</h3>
            <p className="text-gray-600 text-sm">
              Claude's analysis reveals what users hate and opportunities everyone's missing.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Action-Ready Plans</h3>
            <p className="text-gray-600 text-sm">
              Get specific strategies, timelines, and real success stories.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Competitor Card Component
function CompetitorCard({ tool }: { tool: CompetitorData }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 text-red-700';
      case 'medium': return 'bg-yellow-50 text-yellow-700';
      case 'low': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{tool.name}</h3>
          <p className="text-sm text-gray-600">{tool.category}</p>
          <p className="text-sm text-blue-600 font-medium mt-1">{tool.pricing}</p>
        </div>
        {tool.marketShare && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            {tool.marketShare} share
          </span>
        )}
      </div>

      {/* Top Complaints */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Top User Complaints</h4>
        <div className="space-y-1">
          {tool.userComplaints.slice(0, 2).map((complaint, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(complaint.severity)}`}>
                {complaint.frequency}%
              </span>
              <p className="text-xs text-gray-600 flex-1">{complaint.issue}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Opportunity */}
      {tool.industryGaps.length > 0 && (
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm font-semibold text-green-700">
            💡 Opportunity: {tool.industryGaps[0].gap}
          </p>
        </div>
      )}

      {/* Similar Tools */}
      {tool.similarTools.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500 mb-2">Similar tools:</p>
          <div className="flex flex-wrap gap-1">
            {tool.similarTools.slice(0, 3).map((similar) => (
              <span key={similar.id} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                {similar.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}