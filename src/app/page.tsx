// src/app/page.tsx の更新版
// 初期表示を空にして、gap2.htmlのようなクリーンなデザインに

'use client';

import { ToolBadges, ToolsModal, FavoriteButton, FavoritesSection } from '@/components/badges/ToolBadges';
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
  Check,
  Star,
  ArrowRight,
  Zap,
  Globe,
  Rocket
} from 'lucide-react';

// 型定義（既存のまま）
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
  const [isLoading, setIsLoading] = useState(false); // 初期ローディングを false に
  const [hasSearched, setHasSearched] = useState(false); // 検索実行フラグ追加
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  // 新機能の状態管理
  const [activeView, setActiveView] = useState<'grid' | 'comparison' | 'report'>('grid');
  const [selectedTools, setSelectedTools] = useState<CompetitorData[]>([]);
  const [selectedToolForReport, setSelectedToolForReport] = useState<CompetitorData | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [aiUsageCount, setAiUsageCount] = useState(5);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTools, setModalTools] = useState<CompetitorData[]>([]);
  const [modalTitle, setModalTitle] = useState('');

  // データ読み込み（初期表示なし）
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/competitors.json');
        const data = await response.json();
        setCompetitors(data.tools || []);
        // 初期表示を空にする
        setSearchResults([]);
      } catch (error) {
        console.error('Failed to load competitors:', error);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('gapFinderFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    }
  }, []);

  // 検索処理
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // 空の検索の場合は何も表示しない
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    
    // シミュレート遅延（実際のAPIコールのように）
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filtered = competitors.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query) ||
        tool.keywords.some(k => k.toLowerCase().includes(query))
      );
      
      setSearchResults(filtered);
      setIsLoading(false);
    }, 500);
  };

  const handleCategoryClick = (category: string) => {
    const tools = competitors.filter(t => t.category === category);
    setModalTools(tools);
    setModalTitle(`🏷 ${category} (${tools.length} tools)`);
    setShowModal(true);
  };

  // ツール選択（比較用）
  const toggleToolSelection = (tool: CompetitorData) => {
    if (selectedTools.find(t => t.id === tool.id)) {
      setSelectedTools(selectedTools.filter(t => t.id !== tool.id));
    } else if (selectedTools.length < 3) {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const quickSearch = (toolName: string) => {
    setSearchQuery(toolName);
    setHasSearched(true);
    setTimeout(handleSearch, 100);
    setShowModal(false);
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

  const toggleFavorite = (toolId: string) => {
    const newFavorites = favorites.includes(toolId)
      ? favorites.filter(id => id !== toolId)
      : [...favorites, toolId];
    
    setFavorites(newFavorites);
    localStorage.setItem('gapFinderFavorites', JSON.stringify(newFavorites));
  };

  // カテゴリ取得
  const categories = Array.from(new Set(competitors.map(c => c.category)));

  // 人気検索（アイコン付き）
  const popularSearches = [
    { name: 'Canva', icon: '🎨', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { name: 'Notion', icon: '📝', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { name: 'Linear', icon: '📊', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { name: 'Figma', icon: '🖌️', className: 'bg-orange-100 text-orange-700 hover:bg-orange-200' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ヘッダー（グラデーション） */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">🔍 Gap Finder</h1>
          <p className="text-2xl opacity-90">Discover market gaps in seconds</p>
          <p className="text-lg mt-2 opacity-75">Analyze any tool instantly</p>
          
          {/* ユーザーステータス切り替え */}
          <div className="mt-6">
            <button 
              onClick={() => setIsPro(!isPro)}
              className={`px-6 py-3 rounded-full transition ${
                isPro 
                  ? 'bg-yellow-400/30 hover:bg-yellow-400/40' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              🔄 Click to switch: <span className="font-bold">{isPro ? 'Pro Member (AI Analysis Enabled)' : 'Free User (Basic Analysis)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 検索セクション（上に移動） */}
      <div className="max-w-4xl mx-auto px-4 -mt-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="🔎 Enter tool name (e.g., 'Canva', 'Notion', 'Linear')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-6 py-4 text-lg border-2 border-gray-200 rounded-xl 
                       focus:outline-none focus:border-purple-500 transition"
            />
            <button 
              onClick={handleSearch}
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                       text-white text-lg font-semibold rounded-xl 
                       hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
            >
              Analyze Now
            </button>
          </div>
          
          {/* クイック例（アイコン付き） */}
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="text-gray-600 font-medium">Popular searches:</span>
            {popularSearches.map((item) => (
              <button
                key={item.name}
                onClick={() => quickSearch(item.name)}
                className={`px-4 py-2 rounded-full transition font-medium ${item.className}`}
              >
                {item.icon} {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツエリア */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* View切り替えタブ（検索実行後のみ表示） */}
        {hasSearched && searchResults.length > 0 && (
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
        )}

        {/* 結果セクション */}
        {!hasSearched ? (
          // 初期状態（検索前）
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <Rocket className="h-20 w-20 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Start Finding Market Gaps
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Search any tool to discover user complaints, market opportunities, 
                and competitive advantages. Our AI analyzes real user feedback to find 
                gaps you can exploit.
              </p>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Real User Complaints</h3>
                  <p className="text-sm text-gray-600">
                    Aggregated from Reddit, Twitter, and review sites
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
                  <p className="text-sm text-gray-600">
                    Claude analyzes patterns across 100+ competitors
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Revenue Estimates</h3>
                  <p className="text-sm text-gray-600">
                    Realistic ARR projections for each opportunity
                  </p>
                </div>
              </div>
              
              {/* Call to action */}
              <div className="flex flex-wrap justify-center gap-3">
                <span className="text-gray-500">Try searching for:</span>
                {['Slack', 'GitHub', 'Zoom', 'Stripe'].map(example => (
                  <button
                    key={example}
                    onClick={() => quickSearch(example)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full 
                             hover:bg-purple-100 hover:text-purple-700 transition font-medium"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isLoading ? (
          // ローディング状態
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-xl p-12 inline-block">
              <div className="animate-spin h-12 w-12 border-4 border-purple-500 
                            border-t-transparent rounded-full mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">🤖 Analyzing "{searchQuery}"...</h3>
              <p className="text-gray-600">Searching through our database</p>
            </div>
          </div>
        ) : searchResults.length === 0 ? (
          // 検索結果なし
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                📊 "{searchQuery}" - Pro Analysis Available
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                This tool isn't in our free database yet, but Pro members can get instant AI analysis.
              </p>
              <div className="bg-gray-50 rounded-xl p-6 mb-6 max-w-md mx-auto">
                <h4 className="font-bold mb-3">What Pro Members Get:</h4>
                <ul className="text-left space-y-2">
                  <li>✅ Real-time AI analysis of any tool</li>
                  <li>✅ Common gaps across similar tools</li>
                  <li>✅ Rare features identification</li>
                  <li>✅ "What to build" recommendations</li>
                  <li>✅ Competitive comparisons</li>
                  <li>✅ Market opportunity identification</li>
                  <li>✅ Detailed execution blueprints</li>
                </ul>
              </div>
              <button 
                onClick={() => setIsPro(true)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                         text-white rounded-xl font-semibold 
                         hover:from-purple-700 hover:to-pink-700 transition"
              >
                Try Pro Mode (Demo)
              </button>
            </div>
          </div>
        ) : (
          // 検索結果表示
          <>
            {activeView === 'grid' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {searchQuery ? `Results for "${searchQuery}"` : 'Search Results'}
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({searchResults.length} tools found)
                  </span>
                </h3>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
                      isFavorite={favorites.includes(tool.id)}
                      onToggleFavorite={() => toggleFavorite(tool.id)}
                      onCategoryClick={handleCategoryClick}
                      onToolClick={quickSearch}
                      isPro={isPro}
                    />
                  ))}
                </div>
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

        {/* お気に入りセクション */}
        {favorites.length > 0 && (
          <FavoritesSection
            favorites={favorites}
            tools={competitors}
            onToolClick={quickSearch}
            onClearAll={() => {
              setFavorites([]);
              localStorage.removeItem('gapFinderFavorites');
            }}
          />
        )}

        {/* カテゴリモーダル */}
        <ToolsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalTitle}
          tools={modalTools}
          onSelectTool={quickSearch}
        />
      </main>
    </div>
  );
}

// 以下、CompetitorCard、VisualComparisonMatrix、AIReportGeneratorは既存のものをそのまま使用
// ただし、CompetitorCardにisPro propを追加して、Pro機能の表示を制御

interface CompetitorCardProps {
  tool: CompetitorData;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  isSelected: boolean;
  onGenerateReport: () => void;
  onSpeak: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onCategoryClick: (category: string) => void;
  onToolClick: (toolName: string) => void;
  isPro: boolean; // 追加
}

function CompetitorCard({ 
  tool,
  isExpanded,
  onToggle,
  onSelect,
  isSelected,
  onGenerateReport,
  onSpeak,
  isFavorite,
  onToggleFavorite,
  onCategoryClick,
  onToolClick,
  isPro
}: CompetitorCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 text-red-700';
      case 'medium': return 'bg-yellow-50 text-yellow-700';
      case 'low': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{tool.name}</h3>
          <p className="text-sm text-gray-600">{tool.category}</p>
          <p className="text-sm text-blue-600 font-medium mt-1">{tool.pricing}</p>
        </div>
        <div className="flex items-center gap-2">
          <FavoriteButton
            toolId={tool.id}
            isFavorite={isFavorite}
            onToggle={onToggleFavorite}
          />
          {tool.marketShare && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
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

      <ToolBadges
        tool={tool}
        onCategoryClick={onCategoryClick}
        onToolClick={onToolClick}
      />

      <div className="mb-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Top User Feedback</h4>
        <div className="space-y-1">
          {tool.userComplaints.slice(0, isExpanded ? 3 : 2).map((complaint, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(complaint.severity)}`}>
                {complaint.frequency}%
              </span>
              <p className="text-xs text-gray-600 flex-1 line-clamp-2">{complaint.issue}</p>
            </div>
          ))}
        </div>
      </div>

      {tool.industryGaps.length > 0 && (
        <div className="p-3 bg-green-50 rounded-lg mb-3">
          <p className="text-sm font-semibold text-green-700">
            💡 Opportunity: {tool.industryGaps[0].gap}
          </p>
        </div>
      )}

      {/* Pro限定：AI Insights */}
      {isPro && (
        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg mb-3">
          <p className="text-xs font-semibold text-purple-700 mb-1">
            🤖 AI Insight (Pro)
          </p>
          <p className="text-xs text-gray-600">
            87% of tools in this category lack offline support. 
            Building this feature could capture {tool.industryGaps[0]?.successProbability || 65}% of frustrated users.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {isExpanded ? 'Show less' : 'View details'}
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
              <button
                key={similar.id}
                onClick={() => onToolClick(similar.name)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              >
                {similar.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Visual Comparison Matrix Component
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

// AI Report Generator Component
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