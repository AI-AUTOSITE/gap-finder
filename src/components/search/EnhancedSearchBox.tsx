'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  X, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Filter,
  ChevronDown,
  Zap,
  Target,
  AlertCircle,
  DollarSign,
  Star
} from 'lucide-react';

// 型定義
interface SearchSuggestion {
  text: string;
  type: 'tool' | 'category' | 'problem' | 'opportunity';
  icon: React.ReactNode;
  count?: number;
}

interface SearchFilter {
  categories: string[];
  priceRanges: string[];
  difficulties: string[];
  potentials: string[];
}

interface EnhancedSearchBoxProps {
  onSearch: (query: string, filters?: SearchFilter, searchType?: 'smart' | 'basic' | 'problem' | 'opportunity') => void;
  suggestions?: SearchSuggestion[];
  categories?: string[];
  isLoading?: boolean;
}

export function EnhancedSearchBox({ 
  onSearch, 
  suggestions = [], 
  categories = [],
  isLoading = false 
}: EnhancedSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchType, setSearchType] = useState<'smart' | 'basic' | 'problem' | 'opportunity'>('smart');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilter>({
    categories: [],
    priceRanges: [],
    difficulties: [],
    potentials: []
  });
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ローカルストレージから検索履歴を読み込み
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // クリック外で候補を閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 検索実行
  const executeSearch = useCallback((searchQuery: string = query) => {
    if (!searchQuery.trim() && filters.categories.length === 0) return;
    
    // 検索履歴を保存
    if (searchQuery.trim()) {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
    
    onSearch(searchQuery, filters, searchType);
    setShowSuggestions(false);
  }, [query, filters, searchType, recentSearches, onSearch]);

  // サンプル候補を生成
  const generateSuggestions = (): SearchSuggestion[] => {
    if (!query) return [];
    
    const defaultSuggestions: SearchSuggestion[] = [
      {
        text: `${query} alternatives`,
        type: 'tool',
        icon: <Search className="h-4 w-4" />,
        count: 12
      },
      {
        text: `tools with ${query} issues`,
        type: 'problem',
        icon: <AlertCircle className="h-4 w-4" />,
        count: 8
      },
      {
        text: `${query} market opportunities`,
        type: 'opportunity',
        icon: <Target className="h-4 w-4" />,
        count: 5
      }
    ];
    
    return [...suggestions, ...defaultSuggestions].slice(0, 6);
  };

  // フィルターのアクティブ数を計算
  const activeFilterCount = 
    filters.categories.length + 
    filters.priceRanges.length + 
    filters.difficulties.length + 
    filters.potentials.length;

  return (
    <div className="w-full max-w-4xl mx-auto" ref={searchRef}>
      {/* メイン検索ボックス */}
      <div className="relative">
        {/* 検索タイプセレクター */}
        <div className="absolute left-2 top-2 z-10">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSearchType('smart')}
              className={`p-1.5 rounded transition-all ${
                searchType === 'smart' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Smart Search"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSearchType('basic')}
              className={`p-1.5 rounded transition-all ${
                searchType === 'basic' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Basic Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSearchType('problem')}
              className={`p-1.5 rounded transition-all ${
                searchType === 'problem' 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Problem Search"
            >
              <AlertCircle className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSearchType('opportunity')}
              className={`p-1.5 rounded transition-all ${
                searchType === 'opportunity' 
                  ? 'bg-white text-green-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Opportunity Search"
            >
              <Target className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 検索入力 */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => setShowSuggestions(query.length > 0 || recentSearches.length > 0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') executeSearch();
            if (e.key === 'Escape') setShowSuggestions(false);
          }}
          placeholder={
            searchType === 'smart' ? "Search tools, problems, or opportunities..." :
            searchType === 'problem' ? "What problems are you facing? (e.g., 'slow loading')" :
            searchType === 'opportunity' ? "What opportunities to explore? (e.g., 'offline support')" :
            "Search for tools or categories..."
          }
          className="w-full pl-36 pr-32 py-4 text-lg border-2 border-gray-200 rounded-2xl 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                   shadow-lg hover:shadow-xl transition-shadow"
          disabled={isLoading}
        />

        {/* クリアボタン */}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-28 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* フィルターボタン */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-16 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
            activeFilterCount > 0 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Filter className="h-5 w-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* 検索ボタン */}
        <button
          onClick={() => executeSearch()}
          disabled={isLoading || (!query.trim() && activeFilterCount === 0)}
          className="absolute right-2 top-2 px-4 py-3 bg-blue-600 text-white rounded-xl 
                   font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            'Search'
          )}
        </button>

        {/* 検索候補ドロップダウン */}
        {showSuggestions && (
          <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* 最近の検索 */}
            {!query && recentSearches.length > 0 && (
              <div className="p-3 border-b">
                <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  RECENT SEARCHES
                </div>
                {recentSearches.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(search);
                      executeSearch(search);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* 検索候補 */}
            {query && generateSuggestions().length > 0 && (
              <div className="p-3">
                <div className="text-xs font-semibold text-gray-500 mb-2">SUGGESTIONS</div>
                {generateSuggestions().map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(suggestion.text);
                      executeSearch(suggestion.text);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`
                        ${suggestion.type === 'problem' ? 'text-orange-500' :
                          suggestion.type === 'opportunity' ? 'text-green-500' :
                          suggestion.type === 'category' ? 'text-purple-500' :
                          'text-blue-500'}
                      `}>
                        {suggestion.icon}
                      </span>
                      <span>{suggestion.text}</span>
                    </div>
                    {suggestion.count && (
                      <span className="text-xs text-gray-400">{suggestion.count}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* スマート検索の説明 */}
            <div className="p-3 bg-gray-50 border-t text-xs text-gray-600">
              {searchType === 'smart' && (
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-blue-500" />
                  <span>Smart Search finds tools + opportunities + similar alternatives</span>
                </div>
              )}
              {searchType === 'problem' && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-orange-500" />
                  <span>Find tools with specific problems you can solve</span>
                </div>
              )}
              {searchType === 'opportunity' && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-green-500" />
                  <span>Discover market gaps and opportunities</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* フィルターパネル */}
      {showFilters && (
        <FilterPanel 
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          onApply={() => executeSearch()}
        />
      )}

      {/* クイックフィルター */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500">Quick filters:</span>
        
        <QuickFilterButton
          active={filters.priceRanges.includes('free')}
          onClick={() => {
            const updated = filters.priceRanges.includes('free')
              ? filters.priceRanges.filter(p => p !== 'free')
              : [...filters.priceRanges, 'free'];
            setFilters({...filters, priceRanges: updated});
          }}
          icon={<DollarSign className="h-3 w-3" />}
        >
          Free Tools
        </QuickFilterButton>

        <QuickFilterButton
          active={filters.potentials.includes('very high')}
          onClick={() => {
            const updated = filters.potentials.includes('very high')
              ? filters.potentials.filter(p => p !== 'very high')
              : [...filters.potentials, 'very high'];
            setFilters({...filters, potentials: updated});
          }}
          icon={<Zap className="h-3 w-3" />}
        >
          High Potential
        </QuickFilterButton>

        <QuickFilterButton
          active={filters.difficulties.includes('easy')}
          onClick={() => {
            const updated = filters.difficulties.includes('easy')
              ? filters.difficulties.filter(d => d !== 'easy')
              : [...filters.difficulties, 'easy'];
            setFilters({...filters, difficulties: updated});
          }}
          icon={<Star className="h-3 w-3" />}
        >
          Easy to Build
        </QuickFilterButton>

        {activeFilterCount > 0 && (
          <button
            onClick={() => setFilters({ categories: [], priceRanges: [], difficulties: [], potentials: [] })}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}

// フィルターパネルコンポーネント
function FilterPanel({ 
  filters, 
  setFilters, 
  categories,
  onApply 
}: {
  filters: SearchFilter;
  setFilters: (filters: SearchFilter) => void;
  categories: string[];
  onApply: () => void;
}) {
  return (
    <div className="mt-4 p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* カテゴリフィルター */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Categories</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {categories.map(category => (
              <label key={category} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...filters.categories, category]
                      : filters.categories.filter(c => c !== category);
                    setFilters({...filters, categories: updated});
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 価格帯フィルター */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h4>
          <div className="space-y-2">
            {['free', '$0-10', '$10-50', '$50-100', '$100+'].map(range => (
              <label key={range} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.priceRanges.includes(range)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...filters.priceRanges, range]
                      : filters.priceRanges.filter(p => p !== range);
                    setFilters({...filters, priceRanges: updated});
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">{range}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 難易度フィルター */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Difficulty</h4>
          <div className="space-y-2">
            {['easy', 'medium', 'hard'].map(difficulty => (
              <label key={difficulty} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.difficulties.includes(difficulty)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...filters.difficulties, difficulty]
                      : filters.difficulties.filter(d => d !== difficulty);
                    setFilters({...filters, difficulties: updated});
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">{difficulty}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ポテンシャルフィルター */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Potential</h4>
          <div className="space-y-2">
            {['low', 'medium', 'high', 'very high'].map(potential => (
              <label key={potential} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.potentials.includes(potential)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...filters.potentials, potential]
                      : filters.potentials.filter(p => p !== potential);
                    setFilters({...filters, potentials: updated});
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">{potential}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => setFilters({ categories: [], priceRanges: [], difficulties: [], potentials: [] })}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Clear
        </button>
        <button
          onClick={onApply}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

// クイックフィルターボタン
function QuickFilterButton({ 
  children, 
  active, 
  onClick, 
  icon 
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
        active 
          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}