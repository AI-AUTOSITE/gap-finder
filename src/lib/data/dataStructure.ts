// src/lib/data/dataStructure.ts
export interface MasterIndex {
  version: string;
  lastUpdated: string;
  categories: CategoryMeta[];
  totalTools: number;
  searchIndex: string;
}

export interface CategoryMeta {
  id: string;
  name: string;
  emoji: string;
  toolCount: number;
  file: string;
  popularTools: string[];
  trending: boolean;
}

// 建設的な分析スキーマ（v3.0準拠）
export interface CompetitorAnalysis {
  // 基本情報
  id: string;
  name: string;
  category: string;
  website: string;
  pricing: string;
  marketShare?: string;
  
  // 必ず強みから始める（理念準拠）
  strengths: {
    feature: string;
    description: string;
    userBenefit: string;
  }[];
  
  // 建設的な改善機会（批判ではない）
  improvementOpportunities: {
    area: string;
    currentState: string; // 現状の説明（中立的）
    potentialImprovement: string; // 可能性
    userImpact: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  
  // 市場の機会（ギャップではなく機会）
  marketOpportunities: {
    opportunity: string;
    reasoning: string;
    potentialValue: string;
    implementationTips: string[];
  }[];
  
  // 成功事例
  successStories: {
    company: string;
    inspiration: string;
    implementation: string;
    result: string;
    lessons: string[];
  }[];
  
  // メタデータ
  lastUpdated: string;
  dataQuality: 'high' | 'medium' | 'basic';
  disclaimer: string; // 常に含める
}