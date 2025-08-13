// src/lib/data/dataStructure.ts

// マスターインデックス
export interface MasterIndex {
  version: string;
  lastUpdated: string;
  categories: CategoryMeta[];
  totalTools: number;
  searchIndex: string;
}

// カテゴリメタデータ
export interface CategoryMeta {
  id: string;
  name: string;
  description: string;
  file: string;
  toolCount: number;
  iconClass?: string;
  trending?: boolean;
}

// 競合分析データ
export interface CompetitorAnalysis {
  id: string;
  name: string;
  category: string;
  website: string;
  description: string;
  
  // マーケット情報
  marketPosition: MarketPosition;
  pricing: PricingTier[];
  targetAudience: string[];
  
  // 分析データ
  strengths: AnalysisPoint[];
  opportunities: AnalysisPoint[];
  userFeedback: UserFeedback[];
  alternatives: AlternativeTool[];
  
  // メタデータ
  lastUpdated: string;
  dataQuality: 'high' | 'medium' | 'basic';
  disclaimer?: string;
  sources?: string[];
}

// マーケットポジション
export interface MarketPosition {
  marketShare?: string;
  userBase?: string;
  monthlyTraffic?: string;
  ranking?: number;
  growth?: 'rapid' | 'steady' | 'stable' | 'declining';
}

// 価格プラン
export interface PricingTier {
  name: string;
  price: number | string;
  billingCycle?: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  limitations?: string[];
  highlighted?: boolean;
}

// 分析ポイント
export interface AnalysisPoint {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category?: string;
  evidence?: string[];
  actionable?: boolean;
}

// ユーザーフィードバック
export interface UserFeedback {
  type: 'positive' | 'constructive' | 'neutral';
  summary: string;
  frequency: number;
  source?: string;
  dateRange?: string;
}

// 代替ツール
export interface AlternativeTool {
  id: string;
  name: string;
  category: string;
  differentiator: string;
  pricing: string;
  userBase?: string;
  pros?: string[];
  cons?: string[];
}

// 検索インデックス
export interface SearchIndex {
  version: string;
  entries: SearchEntry[];
  categories: string[];
  tags: string[];
}

// 検索エントリ
export interface SearchEntry {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  description: string;
  popularity: number;
  aliases?: string[];
}

// カテゴリデータ
export interface CategoryData {
  id: string;
  name: string;
  description: string;
  tools: ToolSummary[];
  trends: MarketTrend[];
  insights: CategoryInsight[];
  lastUpdated: string;
}

// ツールサマリー
export interface ToolSummary {
  id: string;
  name: string;
  tagline: string;
  logo?: string;
  pricing: string;
  rating?: number;
  userCount?: string;
  tags: string[];
}

// マーケットトレンド
export interface MarketTrend {
  title: string;
  description: string;
  impact: 'rising' | 'steady' | 'declining';
  relatedTools: string[];
  timeframe: string;
}

// カテゴリインサイト
export interface CategoryInsight {
  type: 'opportunity' | 'challenge' | 'trend';
  title: string;
  description: string;
  relevance: number;
  actionItems?: string[];
}

// データレスポンス型
export interface DataResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  timestamp?: string;
}

// エクスポート型
export type {
  MasterIndex as Index,
  CompetitorAnalysis as Analysis,
  CategoryData as Category
};