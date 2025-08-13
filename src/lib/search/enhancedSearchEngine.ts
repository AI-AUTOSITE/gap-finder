// src/lib/search/enhancedSearchEngine.ts
import Fuse from 'fuse.js';
import type { CompetitorData, SearchResult } from '@/types';

// フィルター条件の型定義
export interface SearchFilters {
  categories?: string[];
  priceRanges?: string[];
  difficulties?: ('easy' | 'medium' | 'hard')[];
  potentials?: ('low' | 'medium' | 'high' | 'very high')[];
  minMarketShare?: number;
  maxComplaints?: number;
}

// 検索候補の型定義
export interface SearchSuggestion {
  text: string;
  type: 'tool' | 'category' | 'problem' | 'opportunity' | 'keyword';
  relevance: number;
  matchedTools: number;
}

// スマート検索結果の型定義
export interface SmartSearchResult {
  query: string;
  directMatches: SearchResult[];
  problemBasedMatches: SearchResult[];
  opportunityBasedMatches: SearchResult[];
  similarTools: SearchResult[];
  suggestions: SearchSuggestion[];
  insights: {
    totalOpportunities: number;
    averageDifficulty: string;
    topComplaints: string[];
    marketTrends: string[];
  };
}

export class EnhancedSearchEngine {
  private fuse: Fuse<CompetitorData>;
  private competitors: CompetitorData[];
  private searchHistory: Map<string, number> = new Map();
  
  constructor(competitorsData: CompetitorData[]) {
    this.competitors = competitorsData;
    
    // Fuse.jsの詳細設定
    this.fuse = new Fuse(competitorsData, {
      keys: [
        { name: 'name', weight: 0.30 },
        { name: 'keywords', weight: 0.25 },
        { name: 'aliases', weight: 0.15 },
        { name: 'category', weight: 0.10 },
        { name: 'userComplaints.issue', weight: 0.10 },
        { name: 'industryGaps.gap', weight: 0.05 },
        { name: 'industryGaps.opportunity', weight: 0.05 }
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      useExtendedSearch: true,
      findAllMatches: true,
      ignoreLocation: true
    });
  }

  /**
   * スマート検索 - すべての検索タイプを統合
   */
  smartSearch(query: string, filters?: SearchFilters): SmartSearchResult {
    // 検索履歴を記録
    this.recordSearchHistory(query);
    
    // 各種検索を実行
    const directMatches = this.searchWithFilters(query, filters);
    const problemMatches = this.searchByProblems(query, filters);
    const opportunityMatches = this.searchByOpportunities(query, filters);
    const similar = this.findSimilarTools(directMatches[0]?.tool);
    
    // インサイトを生成
    const insights = this.generateInsights(directMatches, problemMatches, opportunityMatches);
    
    // 検索候補を生成
    const suggestions = this.generateSmartSuggestions(query, directMatches);
    
    return {
      query,
      directMatches: directMatches.slice(0, 5),
      problemBasedMatches: problemMatches.slice(0, 5),
      opportunityBasedMatches: opportunityMatches.slice(0, 5),
      similarTools: similar.slice(0, 5),
      suggestions,
      insights
    };
  }

  /**
   * フィルター付き検索
   */
  searchWithFilters(query: string, filters?: SearchFilters): SearchResult[] {
    let results: SearchResult[] = [];
    
    // 基本検索
    if (query.trim()) {
      const fuseResults = this.fuse.search(query);
      results = fuseResults.map(result => ({
        tool: result.item,
        score: 1 - (result.score || 0),
        matchedKeywords: this.extractMatchedKeywords(result),
        matchType: this.determineMatchType(result)
      }));
    } else {
      // クエリがない場合はすべてのツールを対象に
      results = this.competitors.map(tool => ({
        tool,
        score: 0.5,
        matchedKeywords: [],
        matchType: 'category' as const
      }));
    }
    
    // フィルター適用
    if (filters) {
      results = this.applyFilters(results, filters);
    }
    
    // スコアでソート
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * 問題ベース検索
   */
  searchByProblems(query: string, filters?: SearchFilters): SearchResult[] {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();
    
    this.competitors.forEach(tool => {
      let totalScore = 0;
      let matchCount = 0;
      const matchedProblems: string[] = [];
      
      tool.userComplaints.forEach(complaint => {
        if (complaint.issue.toLowerCase().includes(queryLower)) {
          // 頻度と深刻度からスコアを計算
          const severityScore = complaint.severity === 'high' ? 1.0 : 
                               complaint.severity === 'medium' ? 0.7 : 0.4;
          const frequencyScore = complaint.frequency / 100;
          totalScore += severityScore * frequencyScore;
          matchCount++;
          matchedProblems.push(complaint.issue);
        }
      });
      
      if (matchCount > 0) {
        results.push({
          tool,
          score: totalScore / matchCount,
          matchedKeywords: matchedProblems,
          matchType: 'similar'
        });
      }
    });
    
    // フィルター適用
    let filtered = results;
    if (filters) {
      filtered = this.applyFilters(results, filters);
    }
    
    return filtered.sort((a, b) => b.score - a.score);
  }

  /**
   * 機会ベース検索
   */
  searchByOpportunities(query: string, filters?: SearchFilters): SearchResult[] {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();
    
    this.competitors.forEach(tool => {
      let maxScore = 0;
      const matchedOpportunities: string[] = [];
      
      tool.industryGaps.forEach(gap => {
        if (gap.gap.toLowerCase().includes(queryLower) || 
            gap.opportunity.toLowerCase().includes(queryLower)) {
          
          // ポテンシャルと成功確率からスコアを計算
          const potentialScore = this.getPotentialScore(gap.potential);
          const probabilityScore = (gap.successProbability || 50) / 100;
          const difficultyScore = gap.difficulty === 'easy' ? 1.0 :
                                 gap.difficulty === 'medium' ? 0.7 : 0.4;
          
          const score = potentialScore * probabilityScore * difficultyScore;
          if (score > maxScore) {
            maxScore = score;
          }
          
          matchedOpportunities.push(gap.gap);
        }
      });
      
      if (maxScore > 0) {
        results.push({
          tool,
          score: maxScore,
          matchedKeywords: matchedOpportunities,
          matchType: 'similar'
        });
      }
    });
    
    // フィルター適用
    let filtered = results;
    if (filters) {
      filtered = this.applyFilters(results, filters);
    }
    
    return filtered.sort((a, b) => b.score - a.score);
  }

  /**
   * リアルタイム検索候補生成
   */
  generateSuggestions(partial: string): SearchSuggestion[] {
    if (!partial || partial.length < 2) return [];
    
    const suggestions: SearchSuggestion[] = [];
    const partialLower = partial.toLowerCase();
    
    // ツール名から候補生成
    this.competitors.forEach(tool => {
      if (tool.name.toLowerCase().startsWith(partialLower)) {
        suggestions.push({
          text: tool.name,
          type: 'tool',
          relevance: 1.0,
          matchedTools: 1
        });
      }
    });
    
    // カテゴリから候補生成
    const categories = new Set<string>();
    this.competitors.forEach(tool => {
      if (tool.category.toLowerCase().includes(partialLower)) {
        categories.add(tool.category);
      }
    });
    
    categories.forEach(category => {
      const toolCount = this.competitors.filter(t => t.category === category).length;
      suggestions.push({
        text: category,
        type: 'category',
        relevance: 0.8,
        matchedTools: toolCount
      });
    });
    
    // 問題から候補生成
    const problems = new Map<string, number>();
    this.competitors.forEach(tool => {
      tool.userComplaints.forEach(complaint => {
        if (complaint.issue.toLowerCase().includes(partialLower)) {
          const key = complaint.issue.toLowerCase();
          problems.set(key, (problems.get(key) || 0) + 1);
        }
      });
    });
    
    Array.from(problems.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([problem, count]) => {
        suggestions.push({
          text: `tools with ${problem}`,
          type: 'problem',
          relevance: 0.7,
          matchedTools: count
        });
      });
    
    // 機会から候補生成
    const opportunities = new Map<string, number>();
    this.competitors.forEach(tool => {
      tool.industryGaps.forEach(gap => {
        if (gap.gap.toLowerCase().includes(partialLower)) {
          opportunities.set(gap.gap, (opportunities.get(gap.gap) || 0) + 1);
        }
      });
    });
    
    Array.from(opportunities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .forEach(([opp, count]) => {
        suggestions.push({
          text: `opportunity: ${opp}`,
          type: 'opportunity',
          relevance: 0.6,
          matchedTools: count
        });
      });
    
    // 関連性でソートして上位10件を返す
    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);
  }

  /**
   * スマート検索候補生成
   */
  private generateSmartSuggestions(query: string, results: SearchResult[]): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    
    // 類似検索の提案
    if (results.length > 0) {
      suggestions.push({
        text: `${results[0].tool.name} alternatives`,
        type: 'tool',
        relevance: 0.9,
        matchedTools: results[0].tool.similarTools.length
      });
    }
    
    // カテゴリ検索の提案
    const topCategory = results[0]?.tool.category;
    if (topCategory) {
      const categoryCount = this.competitors.filter(t => t.category === topCategory).length;
      suggestions.push({
        text: `All ${topCategory} tools`,
        type: 'category',
        relevance: 0.8,
        matchedTools: categoryCount
      });
    }
    
    // 問題検索の提案
    suggestions.push({
      text: `${query} performance issues`,
      type: 'problem',
      relevance: 0.7,
      matchedTools: this.searchByProblems(`${query} slow`).length
    });
    
    // 機会検索の提案
    suggestions.push({
      text: `${query} market opportunities`,
      type: 'opportunity',
      relevance: 0.6,
      matchedTools: this.searchByOpportunities(query).length
    });
    
    return suggestions.filter(s => s.matchedTools > 0);
  }

  /**
   * フィルター適用
   */
  private applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    return results.filter(result => {
      const tool = result.tool;
      
      // カテゴリフィルター
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(tool.category)) return false;
      }
      
      // 価格帯フィルター
      if (filters.priceRanges && filters.priceRanges.length > 0) {
        const priceMatch = filters.priceRanges.some(range => {
          if (range === 'free') return tool.pricing.toLowerCase().includes('free');
          if (range === '$0-10') return this.isPriceInRange(tool.pricing, 0, 10);
          if (range === '$10-50') return this.isPriceInRange(tool.pricing, 10, 50);
          if (range === '$50-100') return this.isPriceInRange(tool.pricing, 50, 100);
          if (range === '$100+') return this.isPriceInRange(tool.pricing, 100, Infinity);
          return false;
        });
        if (!priceMatch) return false;
      }
      
      // 難易度フィルター
      if (filters.difficulties && filters.difficulties.length > 0) {
        const hasMatchingGap = tool.industryGaps.some(gap => 
          filters.difficulties!.includes(gap.difficulty)
        );
        if (!hasMatchingGap) return false;
      }
      
      // ポテンシャルフィルター
      if (filters.potentials && filters.potentials.length > 0) {
        const hasMatchingPotential = tool.industryGaps.some(gap => 
          filters.potentials!.includes(gap.potential)
        );
        if (!hasMatchingPotential) return false;
      }
      
      return true;
    });
  }

  /**
   * インサイト生成
   */
  private generateInsights(
    direct: SearchResult[], 
    problems: SearchResult[], 
    opportunities: SearchResult[]
  ) {
    // トップの不満を集計
    const allComplaints = new Map<string, number>();
    [...direct, ...problems].forEach(result => {
      result.tool.userComplaints.forEach(complaint => {
        const key = complaint.issue;
        allComplaints.set(key, (allComplaints.get(key) || 0) + complaint.frequency);
      });
    });
    
    const topComplaints = Array.from(allComplaints.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([complaint]) => complaint);
    
    // 平均難易度を計算
    const difficulties = opportunities.flatMap(r => 
      r.tool.industryGaps.map(g => g.difficulty)
    );
    const difficultyMode = this.getMode(difficulties);
    
    // マーケットトレンドを抽出
    const trends = this.extractMarketTrends([...direct, ...opportunities]);
    
    return {
      totalOpportunities: opportunities.reduce((sum, r) => 
        sum + r.tool.industryGaps.length, 0
      ),
      averageDifficulty: difficultyMode || 'medium',
      topComplaints,
      marketTrends: trends
    };
  }

  /**
   * 類似ツールを検索
   */
  private findSimilarTools(baseTool?: CompetitorData): SearchResult[] {
    if (!baseTool) return [];
    
    return baseTool.similarTools.map(similar => {
      const fullTool = this.competitors.find(t => t.id === similar.id);
      if (!fullTool) {
        // モックデータを作成
        return {
          tool: {
            ...baseTool,
            id: similar.id,
            name: similar.name,
            pricing: similar.pricing
          },
          score: similar.similarity / 100,
          matchedKeywords: [],
          matchType: 'similar' as const
        };
      }
      
      return {
        tool: fullTool,
        score: similar.similarity / 100,
        matchedKeywords: [],
        matchType: 'similar' as const
      };
    });
  }

  /**
   * マーケットトレンド抽出
   */
  private extractMarketTrends(results: SearchResult[]): string[] {
    const trends = new Set<string>();
    
    results.forEach(result => {
      // 共通のギャップを見つける
      result.tool.industryGaps.forEach(gap => {
        if (gap.potential === 'very high' || gap.potential === 'high') {
          trends.add(gap.gap);
        }
      });
    });
    
    return Array.from(trends).slice(0, 5);
  }

  // ========== ユーティリティメソッド ==========

  private extractMatchedKeywords(result: any): string[] {
    const keywords = new Set<string>();
    result.matches?.forEach((match: any) => {
      if (match.value) keywords.add(match.value);
    });
    return Array.from(keywords);
  }

  private determineMatchType(result: any): 'exact' | 'partial' | 'similar' | 'category' {
    const score = result.score || 0;
    if (score < 0.1) return 'exact';
    if (score < 0.3) return 'partial';
    if (score < 0.5) return 'similar';
    return 'category';
  }

  private getPotentialScore(potential: string): number {
    switch (potential) {
      case 'very high': return 1.0;
      case 'high': return 0.75;
      case 'medium': return 0.5;
      case 'low': return 0.25;
      default: return 0.5;
    }
  }

  private isPriceInRange(pricing: string, min: number, max: number): boolean {
    const priceMatch = pricing.match(/\$(\d+)/);
    if (!priceMatch) return false;
    const price = parseInt(priceMatch[1]);
    return price >= min && price <= max;
  }

  private getMode(arr: string[]): string | null {
    const frequency: Record<string, number> = {};
    let maxFreq = 0;
    let mode: string | null = null;
    
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
      if (frequency[item] > maxFreq) {
        maxFreq = frequency[item];
        mode = item;
      }
    });
    
    return mode;
  }

  private recordSearchHistory(query: string): void {
    this.searchHistory.set(query, (this.searchHistory.get(query) || 0) + 1);
  }

  // ========== パブリックAPI ==========

  /**
   * 人気の検索キーワードを取得
   */
  getPopularSearches(): string[] {
    return Array.from(this.searchHistory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query]) => query);
  }

  /**
   * すべてのカテゴリを取得
   */
  getAllCategories(): string[] {
    const categories = new Set<string>();
    this.competitors.forEach(tool => categories.add(tool.category));
    return Array.from(categories).sort();
  }

  /**
   * 統計情報を取得
   */
  getStatistics() {
    const totalTools = this.competitors.length;
    const categories = this.getAllCategories().length;
    const totalComplaints = this.competitors.reduce((sum, tool) => 
      sum + tool.userComplaints.length, 0
    );
    const totalOpportunities = this.competitors.reduce((sum, tool) => 
      sum + tool.industryGaps.length, 0
    );
    
    return {
      totalTools,
      categories,
      totalComplaints,
      totalOpportunities,
      averageComplaintsPerTool: totalComplaints / totalTools,
      averageOpportunitiesPerTool: totalOpportunities / totalTools
    };
  }
}