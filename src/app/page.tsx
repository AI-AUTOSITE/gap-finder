'use client';

import { useState } from 'react';
import { Search, Wifi, WifiOff, Target, Users, Lightbulb, TrendingUp, Download } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 人気の検索候補
  const popularSearches = ['Canva', 'Figma', 'Notion', 'Slack', 'Zoom', 'GitHub'];

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    // 後で実装: 実際の検索処理
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gap Finder</h1>
                <p className="text-xs text-gray-600">Smart Competitor Analysis</p>
              </div>
            </div>

            {/* Status & CTA */}
            <div className="flex items-center space-x-4">
              {/* Online/Offline Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                {isOnline ? 'Online' : 'Offline Mode'}
              </div>
              
              {/* Pro Button */}
              <button className="btn-primary">
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
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Discover market gaps by analyzing competitors + similar tools. 
            Get actionable insights powered by AI. Works offline.
          </p>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search competitor or describe your idea (e.g., 'design tool', 'canva alternative')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              />
            </div>
            
            <button
              onClick={() => handleSearch(searchQuery)}
              disabled={!searchQuery.trim() || isLoading}
              className="mt-4 btn-primary text-lg px-8 py-3 disabled:opacity-50"
            >
              {isLoading ? 'Analyzing...' : 'Find Gaps & Opportunities'}
            </button>
          </div>

          {/* Quick Searches */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-gray-500 mr-2">Popular searches:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchQuery(term);
                  handleSearch(term);
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry-Wide Analysis</h3>
            <p className="text-gray-600 text-sm">
              See 5+ similar tools at once. Discover patterns across the entire industry, not just one competitor.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Strategic Insights</h3>
            <p className="text-gray-600 text-sm">
              Claude's sharp analysis reveals what users hate and what opportunities everyone's missing.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Action-Ready Plans</h3>
            <p className="text-gray-600 text-sm">
              Not just data - get specific strategies, timelines, and real success stories to guide your next move.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white text-center mb-16">
          <h3 className="text-2xl font-bold mb-4">Trusted by Indie Hackers Worldwide</h3>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-blue-100">Tools Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-blue-100">Works Offline</div>
            </div>
            <div>
              <div className="text-3xl font-bold">$4.99</div>
              <div className="text-blue-100">Per Month</div>
            </div>
          </div>
        </div>

        {/* Sample Analysis Preview */}
        <div className="card mb-16">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Sample Analysis: Canva</h3>
          <p className="text-gray-600 mb-6">
            Here's what our analysis reveals about design tools like Canva:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-red-700 mb-2">What Users Hate Most</h4>
              <ul className="text-sm text-red-600 space-y-1">
                <li>• 34% complain about slow loading times</li>
                <li>• 28% need offline functionality</li>
                <li>• 22% want more customization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-700 mb-2">Your Opportunity</h4>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Build a 5-second loading design tool</li>
                <li>• Offline-first PWA approach</li>
                <li>• Developer-friendly customization</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>💡 Claude's Insight:</strong> All major design tools share the same weakness - they're slow and online-only. 
              This creates a huge opportunity for a fast, offline-capable alternative.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>Built for indie hackers, by indie hackers. 🚀</p>
          <p className="text-sm mt-2">
            Find your competitive edge with AI-powered market analysis.
          </p>
        </div>
      </footer>
    </div>
  );
}