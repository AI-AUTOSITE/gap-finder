// src/lib/search/searchEngine.ts
import Fuse from 'fuse.js';
import type { FuseResult } from 'fuse.js';
import type { 
  CompetitorData, 
  SearchResult, 
  SimilarTool 
} from '@/types';

// 検索エンジンクラス
export class SearchEngine {
  private fuse: Fuse<CompetitorData>;
  private competitors: CompetitorData[];
  
  constructor(competitorsData: CompetitorData[]) {
    this.competitors = competitorsData;
    
    // Fuse.js設定（高速ファジー検索）
    this.fuse = new Fuse(competitorsData, {
      keys: [
        { name: 'name', weight: 0.35 },        // ツール名が最重要
        { name: 'keywords', weight: 0.25 },    // キーワード
        { name: 'aliases', weight: 0.20 },     // 別名
        { name: 'category', weight: 0.15 },    // カテゴリ
        { name: 'userComplaints.issue', weight: 0.05 } // 不満も検索対象
      ],
      threshold: 0.4,        // マッチング感度（0.0=完全一致、1.0=すべて）
      includeScore: true,    // スコア含める
      includeMatches: true,  // マッチ箇所含める
      minMatchCharLength: 2, // 最小マッチ文字数
      useExtendedSearch: true
    });
  }
  
  /**
   * 基本検索 - ツール名やキーワードで検索
   */
  search(query: string, limit: number = 10): SearchResult[] {
    if (!query.trim()) return [];
    
    // 検索実行
    const results = this.fuse.search(query).slice(0, limit);
    
    // 結果を整形
    return results.map(result => ({
      tool: result.item,
      score: 1 - (result.score || 0), // スコアを0-1に正規化（1が最高）
      matchedKeywords: this.extractMatchedKeywords(result),
      matchType: this.determineMatchType(result)
    }));
  }
  
  /**
   * 類似ツールも含めた検索
   * メインツール + その類似ツール5個を返す
   */
  searchWithSimilar(query: string): SearchResult[] {
    const mainResults = this.search(query, 1);
    
    if (mainResults.length === 0) {
      return [];
    }
    
    const mainTool = mainResults[0].tool;
    const similarResults = this.getSimilarToolsAsResults(mainTool);
    
    return [...mainResults, ...similarResults];
  }
  
  /**
   * カテゴリ検索 - 特定カテゴリのすべてのツール
   */
  searchByCategory(category: string): SearchResult[] {
    const filtered = this.competitors.filter(
      tool => tool.category.toLowerCase() === category.toLowerCase()
    );
    
    return filtered.map(tool => ({
      tool,
      score: 1.0,
      matchedKeywords: [category],
      matchType: 'category' as const
    }));
  }
  
  /**
   * 問題ベース検索 - ユーザーの不満から検索
   * 例: "slow loading" → 読み込みが遅いと不満があるツール
   */
  searchByProblem(problem: string): SearchResult[] {
    const results: SearchResult[] = [];
    
    this.competitors.forEach(tool => {
      tool.userComplaints.forEach(complaint => {
        if (complaint.issue.toLowerCase().includes(problem.toLowerCase())) {
          results.push({
            tool,
            score: complaint.frequency / 100, // 頻度をスコアに
            matchedKeywords: [problem],
            matchType: 'similar' as const
          });
        }
      });
    });
    
    // スコアでソート
    return results.sort((a, b) => b.score - a.score);
  }
  
  /**
   * 機会ベース検索 - 市場ギャップから検索
   * 例: "offline" → オフライン機能がギャップのツール
   */
  searchByOpportunity(opportunity: string): SearchResult[] {
    const results: SearchResult[] = [];
    
    this.competitors.forEach(tool => {
      tool.industryGaps.forEach(gap => {
        if (gap.gap.toLowerCase().includes(opportunity.toLowerCase()) ||
            gap.opportunity.toLowerCase().includes(opportunity.toLowerCase())) {
          
          // 成功確率とポテンシャルからスコア計算
          const potentialScore = this.getPotentialScore(gap.potential);
          const score = ((gap.successProbability || 50) / 100) * potentialScore;
          
          results.push({
            tool,
            score,
            matchedKeywords: [opportunity],
            matchType: 'similar' as const
          });
        }
      });
    });
    
    return results.sort((a, b) => b.score - a.score);
  }
  
  /**
   * スマート検索 - すべての検索方法を組み合わせ
   */
  smartSearch(query: string): {
    directMatches: SearchResult[];
    similarTools: SearchResult[];
    relatedByProblem: SearchResult[];
    opportunities: SearchResult[];
  } {
    return {
      directMatches: this.search(query, 3),
      similarTools: this.searchWithSimilar(query).slice(1), // メインを除く
      relatedByProblem: this.searchByProblem(query).slice(0, 3),
      opportunities: this.searchByOpportunity(query).slice(0, 3)
    };
  }
  
  /**
   * 検索候補の生成（オートコンプリート用）
   */
  getSuggestions(partial: string): string[] {
    if (!partial || partial.length < 2) return [];
    
    const suggestions = new Set<string>();
    const lowerPartial = partial.toLowerCase();
    
    this.competitors.forEach(tool => {
      // ツール名
      if (tool.name.toLowerCase().startsWith(lowerPartial)) {
        suggestions.add(tool.name);
      }
      
      // エイリアス
      tool.aliases.forEach(alias => {
        if (alias.toLowerCase().startsWith(lowerPartial)) {
          suggestions.add(alias);
        }
      });
      
      // キーワード
      tool.keywords.forEach(keyword => {
        if (keyword.toLowerCase().startsWith(lowerPartial)) {
          suggestions.add(keyword);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 8);
  }
  
  /**
   * 人気ツールの取得（コミュニティ投票順）
   */
  getPopularTools(limit: number = 6): CompetitorData[] {
    return [...this.competitors]
      .sort((a, b) => b.communityVotes - a.communityVotes)
      .slice(0, limit);
  }
  
  /**
   * ユーザーリクエストツールの取得
   */
  getUserRequestedTools(): CompetitorData[] {
    return this.competitors.filter(tool => tool.userRequested);
  }
  
  /**
   * カテゴリ一覧の取得
   */
  getAllCategories(): string[] {
    const categories = new Set<string>();
    this.competitors.forEach(tool => {
      categories.add(tool.category);
    });
    return Array.from(categories).sort();
  }
  
  // ================== ヘルパーメソッド ==================
  
  /**
   * マッチしたキーワードを抽出
   */
  private extractMatchedKeywords(result: Fuse.FuseResult<CompetitorData>): string[] {
    const keywords = new Set<string>();
    
    result.matches?.forEach(match => {
      if (match.value) {
        keywords.add(match.value);
      }
    });
    
    return Array.from(keywords);
  }
  
  /**
   * マッチタイプを判定
   */
  private determineMatchType(result: Fuse.FuseResult<CompetitorData>): 'exact' | 'partial' | 'similar' | 'category' {
    const score = result.score || 0;
    
    if (score < 0.1) return 'exact';
    if (score < 0.3) return 'partial';
    if (score < 0.5) return 'similar';
    return 'category';
  }
  
  /**
   * 類似ツールを検索結果形式で取得
   */
  private getSimilarToolsAsResults(tool: CompetitorData): SearchResult[] {
    return tool.similarTools.map(similar => {
      // 類似ツールのIDから完全データを取得
      const fullTool = this.competitors.find(t => t.id === similar.id);
      
      if (!fullTool) {
        // 完全データがない場合は仮データを作成
        const mockTool: CompetitorData = {
          id: similar.id,
          name: similar.name,
          category: tool.category,
          website: '',
          pricing: similar.pricing,
          marketShare: similar.marketShare,
          keywords: [],
          aliases: [],
          industryPosition: 'emerging' as const,
          similarTools: [],
          userComplaints: [],
          industryGaps: [],
          actionStrategies: [],
          successStories: [],
          lastUpdated: '',
          dataQuality: 'basic' as const,
          communityVotes: 0,
          userRequested: false
        };
        
        return {
          tool: mockTool,
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
   * ポテンシャルをスコアに変換
   */
  private getPotentialScore(potential: string): number {
    switch (potential) {
      case 'very high': return 1.0;
      case 'high': return 0.75;
      case 'medium': return 0.5;
      case 'low': return 0.25;
      default: return 0.5;
    }
  }
}

// ================== エクスポート用ファクトリー関数 ==================

/**
 * 検索エンジンのインスタンスを作成
 */
export function createSearchEngine(competitorsData: CompetitorData[]): SearchEngine {
  return new SearchEngine(competitorsData);
}

/**
 * JSONファイルから検索エンジンを初期化
 */
export async function initSearchEngineFromJSON(jsonPath: string = '/data/competitors.json'): Promise<SearchEngine> {
  try {
    const response = await fetch(jsonPath);
    const data = await response.json();
    return createSearchEngine(data.tools);
  } catch (error) {
    console.error('Failed to load competitors data:', error);
    // フォールバック: 空の配列で初期化
    return createSearchEngine([]);
  }
}