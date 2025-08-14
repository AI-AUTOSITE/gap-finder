'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Target, 
  TrendingUp, 
  Users, 
  Lightbulb,
  ChevronDown,
  Sparkles,
  Shield,
  Clock,
  Volume2,
  BarChart3,
  FileText,
  Check
} from 'lucide-react';

// 型定義
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
    successProbability?: number;
  }>;
  similarTools: Array<{
    id: string;
    name: string;
    pricing: string;
    strength: string;
    weakness: string;
  }>;
  actionStrategies?: Array<{
    strategy: string;
    description: string;
  }>;
  successStories?: Array<{
    company: string;
    result: string;
  }>;
}

export default function Home() {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompetitorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  // 新機能の状態管理
  const [activeView, setActiveView] = useState<'grid' | 'comparison' | 'report'>('grid');
  const [selectedTools, setSelectedTools] = useState<CompetitorData[]>([]);
  const [selectedToolForReport, setSelectedToolForReport] = useState<CompetitorData | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [aiUsageCount, setAiUsageCount] = useState(5);

  // データ読み込み
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/competitors.json');
        const data = await response.json();
        setCompetitors(data.tools || []);
        setSearchResults(data.tools?.slice(0, 6) || []);
      } catch (error) {
        console.error('Failed to load competitors:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
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

  // ツール選択（比較用）
  const toggleToolSelection = (tool: CompetitorData) => {
    if (selectedTools.find(t => t.id === tool.id)) {
      setSelectedTools(selectedTools.filter(t => t.id !== tool.id));
    } else if (selectedTools.length < 3) {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  // テキスト読み上げ
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // カテゴリ取得
  const categories = Array.from(new Set(competitors.map(c => c.category)));

  // 人気検索
  const popularSearches = ['Canva', 'Figma', 'Notion', 'Slack', 'Zoom', 'GitHub'];

  // View切り替えを処理するイベントリスナー
  useEffect(() => {
    const handleViewChange = (event: CustomEvent) => {
      if (event.detail && event.detail.view) {
        setActiveView(event.detail.view);
      }
    };

    window.addEventListener('change-view' as any, handleViewChange);
    return () => {
      window.removeEventListener('change-view' as any, handleViewChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Main Content - ヘッダー削除 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* View Switcher Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('grid')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeView === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setActiveView('comparison')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeView === 'comparison' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              } ${selectedTools.length > 0 ? '' : 'opacity-50 cursor-not-allowed'}`}
              disabled={selectedTools.length === 0}
            >
              Compare ({selectedTools.length})
            </button>
            <button
              onClick={() => setActiveView('report')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeView === 'report' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              AI Reports
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Find Your Competitive Edge
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Discover market gaps by analyzing competitors + similar tools. 
            <span className="block sm:inline"> Get actionable insights powered by AI. Works offline.</span>
          </p>
          
          <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-3.5 sm:top-4 h-5 sm:h-6 w-5 sm:w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 sm:pl-12 pr-24 sm:pr-32 py-3 sm:py-4 text-base sm:text-lg 
                         border border-gray-300 rounded-xl sm:rounded-2xl 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-2 px-4 sm:px-6 py-2 sm:py-3 
                         bg-blue-600 text-white rounded-lg sm:rounded-xl 
                         text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors"
              >
                <span className="hidden sm:inline">Find Gaps</span>
                <span className="sm:hidden">Search</span>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-xs sm:text-sm text-gray-500">Popular:</span>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    setTimeout(handleSearch, 100);
                  }}
                  className="px-2 sm:px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 
                           rounded-full text-xs sm:text-sm transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Browse by Category
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchResults(competitors.slice(0, 6));
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                !selectedCategory 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Tools
            </button>
            {categories.slice(0, 5).map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSearchResults(competitors.filter(c => c.category === category));
                }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
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

        {/* Main Content Area */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-10 sm:h-12 w-10 sm:w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading competitor data...</p>
          </div>
        ) : (
          <>
            {activeView === 'grid' && (
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {selectedCategory ? `${selectedCategory} Tools` : 
                   searchQuery ? `Results for "${searchQuery}"` : 'Popular Tools'}
                  <span className="text-xs sm:text-sm font-normal text-gray-600 ml-2">
                    ({searchResults.length} tools)
                  </span>
                </h3>

                {searchResults.length === 0 ? (
                  <div className="text-center py-12 sm:py-16 bg-white rounded-xl">
                    <Target className="h-12 sm:h-16 w-12 sm:w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                      No tools found
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Try searching for something else or browse by category
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {searchResults.map((tool) => (
                      <CompetitorCard 
                        key={tool.id} 
                        tool={tool}
                        isExpanded={expandedCard === tool.id}
                        onToggle={() => setExpandedCard(expandedCard === tool.id ? null : tool.id)}
                        onSelect={() => toggleToolSelection(tool)}
                        isSelected={selectedTools.some(t => t.id === tool.id)}
                        onGenerateReport={() => {
                          setSelectedToolForReport(tool);
                          setActiveView('report');
                        }}
                        onSpeak={() => {
                          const text = `${tool.name}. ${tool.category}. Price: ${tool.pricing}. 
                            Top complaint: ${tool.userComplaints[0]?.issue || 'None'}. 
                            Top opportunity: ${tool.industryGaps[0]?.gap || 'None'}.`;
                          speakText(text);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeView === 'comparison' && (
              <VisualComparisonMatrix 
                tools={selectedTools}
                onRemoveTool={(toolId) => setSelectedTools(selectedTools.filter(t => t.id !== toolId))}
                onClearAll={() => setSelectedTools([])}
              />
            )}

            {activeView === 'report' && (
              <AIReportGenerator 
                tool={selectedToolForReport || searchResults[0]}
                isPro={isPro}
                aiUsageCount={aiUsageCount}
                onUpgrade={() => setIsPro(true)}
                onUseAI={() => setAiUsageCount(prev => Math.max(0, prev - 1))}
              />
            )}
          </>
        )}

        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16">
          <FeatureCard
            icon={<Users className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />}
            title="Industry Analysis"
            description="See 5+ similar tools at once"
            color="blue"
          />
          <FeatureCard
            icon={<Lightbulb className="h-5 sm:h-6 w-5 sm:w-6 text-green-600" />}
            title="AI Insights"
            description="Smart opportunity detection"
            color="green"
          />
          <FeatureCard
            icon={<TrendingUp className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600" />}
            title="Action Plans"
            description="Step-by-step strategies"
            color="purple"
          />
          <FeatureCard
            icon={<Shield className="h-5 sm:h-6 w-5 sm:w-6 text-orange-600" />}
            title="Works Offline"
            description="Full access without internet"
            color="orange"
          />
        </div>
      </main>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100'
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
      <div className={`w-10 sm:w-12 h-10 sm:h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-600">{description}</p>
    </div>
  );
}

// Enhanced Competitor Card Component
function CompetitorCard({ 
  tool,
  isExpanded,
  onToggle,
  onSelect,
  isSelected,
  onGenerateReport,
  onSpeak
}: { 
  tool: CompetitorData;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  isSelected: boolean;
  onGenerateReport: () => void;
  onSpeak: () => void;
}) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 text-red-700';
      case 'medium': return 'bg-yellow-50 text-yellow-700';
      case 'low': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{tool.name}</h3>
          <p className="text-xs sm:text-sm text-gray-600">{tool.category}</p>
          <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1">{tool.pricing}</p>
        </div>
        <div className="flex items-center gap-2">
          {tool.marketShare && (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {tool.marketShare}
            </span>
          )}
          <button
            onClick={onSelect}
            className={`p-1.5 rounded-lg transition-colors ${
              isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
          >
            {isSelected ? <Check className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mb-3 sm:mb-4">
        <h4 className="font-semibold text-xs sm:text-sm text-gray-700 mb-2">Top User Feedback</h4>
        <div className="space-y-1">
          {tool.userComplaints.slice(0, isExpanded ? 3 : 2).map((complaint, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${getSeverityColor(complaint.severity)}`}>
                {complaint.frequency}%
              </span>
              <p className="text-xs text-gray-600 flex-1 line-clamp-2">{complaint.issue}</p>
            </div>
          ))}
        </div>
      </div>

      {tool.industryGaps.length > 0 && (
        <div className="p-2 sm:p-3 bg-green-50 rounded-lg mb-3">
          <p className="text-xs sm:text-sm font-semibold text-green-700">
            💡 Opportunity: {tool.industryGaps[0].gap}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {isExpanded ? 'Show less' : 'View details'}
          <ChevronDown className={`h-3 sm:h-4 w-3 sm:w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onSpeak}
            className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
            title="Read aloud"
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <button
            onClick={onGenerateReport}
            className="p-1.5 text-gray-600 hover:text-purple-600 transition-colors"
            title="Generate report"
          >
            <FileText className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t space-y-2">
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

// Visual Comparison Matrix Component (Simplified)
function VisualComparisonMatrix({ 
  tools, 
  onRemoveTool,
  onClearAll
}: { 
  tools: CompetitorData[];
  onRemoveTool: (toolId: string) => void;
  onClearAll: () => void;
}) {
  if (tools.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No tools selected for comparison
        </h3>
        <p className="text-gray-600">
          Select up to 3 tools from the grid view to compare them side by side
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Comparing {tools.length} Tools
        </h3>
        <button
          onClick={onClearAll}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Clear All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4 font-semibold text-gray-900">Criteria</th>
              {tools.map(tool => (
                <th key={tool.id} className="p-4 text-center">
                  <div className="font-semibold text-gray-900">{tool.name}</div>
                  <button
                    onClick={() => onRemoveTool(tool.id)}
                    className="text-xs text-red-600 hover:text-red-700 mt-1"
                  >
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-4 font-medium text-gray-700">Pricing</td>
              {tools.map(tool => (
                <td key={tool.id} className="p-4 text-center">{tool.pricing}</td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium text-gray-700">Market Share</td>
              {tools.map(tool => (
                <td key={tool.id} className="p-4 text-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {tool.marketShare || 'N/A'}
                  </span>
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium text-gray-700">Top Complaint</td>
              {tools.map(tool => (
                <td key={tool.id} className="p-4">
                  <div className="text-sm">
                    <span className="text-red-600 font-medium">
                      {tool.userComplaints[0]?.frequency || 0}%
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {tool.userComplaints[0]?.issue || 'None'}
                    </p>
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium text-gray-700">Opportunities</td>
              {tools.map(tool => (
                <td key={tool.id} className="p-4 text-center">
                  <span className="text-2xl font-bold text-green-600">
                    {tool.industryGaps.length}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// AI Report Generator Component (Simplified)
function AIReportGenerator({ 
  tool,
  isPro,
  aiUsageCount,
  onUpgrade,
  onUseAI
}: { 
  tool: CompetitorData | null;
  isPro: boolean;
  aiUsageCount: number;
  onUpgrade: () => void;
  onUseAI: () => void;
}) {
  const [reportType, setReportType] = useState<'executive' | 'technical' | 'investor'>('executive');
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!tool) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Select a tool to generate report
        </h3>
      </div>
    );
  }

  const generateReport = () => {
    if (!isPro && aiUsageCount <= 0) {
      onUpgrade();
      return;
    }

    setIsGenerating(true);
    if (!isPro) onUseAI();

    // Simulate report generation
    setTimeout(() => {
      const report = `# ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report: ${tool.name}

## Overview
${tool.name} is a ${tool.category.toLowerCase()} with ${tool.marketShare || 'significant'} market share.

## Key Findings
- **Pricing**: ${tool.pricing}
- **Top Complaint**: ${tool.userComplaints[0]?.issue || 'None identified'} (${tool.userComplaints[0]?.frequency || 0}% of users)
- **Main Opportunity**: ${tool.industryGaps[0]?.gap || 'Market analysis pending'}

## Recommendations
1. Focus on ${tool.industryGaps[0]?.gap || 'performance improvements'}
2. Target users frustrated with ${tool.userComplaints[0]?.issue || 'current solutions'}
3. Implement with ${tool.industryGaps[0]?.difficulty || 'moderate'} difficulty

---
*Generated by Gap Finder AI*`;
      
      setGeneratedReport(report);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            AI Report Generator - {tool.name}
          </h3>
          {!isPro && (
            <div className="text-right">
              <p className="text-sm text-gray-600">AI uses remaining:</p>
              <p className="text-2xl font-bold text-blue-600">{aiUsageCount}/5</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          {(['executive', 'technical', 'investor'] as const).map(type => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                reportType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={generateReport}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate {reportType} Report
            </>
          )}
        </button>
      </div>

      {generatedReport && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans">{generatedReport}</pre>
          </div>
          <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Download Report
          </button>
        </div>
      )}

      {!isPro && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-2">🚀 Upgrade to Pro</h4>
          <p className="text-sm text-gray-600 mb-4">
            Get unlimited AI reports, advanced analytics, and priority support
          </p>
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Start Free Trial
          </button>
        </div>
      )}
    </div>
  );
}