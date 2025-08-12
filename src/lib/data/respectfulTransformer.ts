// src/lib/data/respectfulTransformer.ts

export class RespectfulDataTransformer {
  
  // ネガティブな表現を建設的に変換
  private static respectfulTerms: Record<string, string> = {
    // パフォーマンス関連
    'slow': 'deliberate processing',
    'heavy': 'feature-rich',
    'sluggish': 'comprehensive',
    'laggy': 'thorough',
    'crashes': 'occasionally requires restart',
    
    // UI/UX関連
    'complex': 'feature-complete',
    'confusing': 'learning opportunity',
    'cluttered': 'information-rich',
    'outdated': 'established design',
    'ugly': 'functional design',
    
    // 機能関連
    'limited': 'focused',
    'missing': 'opportunity for',
    'lacks': 'room for',
    'poor': 'developing',
    'bad': 'evolving',
    
    // 価格関連
    'expensive': 'premium-priced',
    'overpriced': 'value-focused pricing',
    'costly': 'investment-based',
    
    // 一般的な批判
    'problem': 'opportunity',
    'issue': 'area for enhancement',
    'complaint': 'user feedback',
    'weakness': 'growth area',
    'flaw': 'refinement opportunity'
  };
  
  // データを建設的に変換
  static transformToRespectful(data: CompetitorData): RespectfulCompetitorAnalysis {
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      website: data.website,
      pricing: data.pricing,
      marketShare: data.marketShare,
      
      // 強みを最初に（そして拡張）
      strengths: this.enhanceStrengths(data),
      
      // 不満を機会に変換
      improvementOpportunities: this.transformComplaints(data.userComplaints),
      
      // ギャップを機会に変換
      marketOpportunities: this.transformGaps(data.industryGaps),
      
      // 成功事例を inspirational に
      inspiringExamples: this.transformSuccessStories(data.successStories),
      
      lastUpdated: data.lastUpdated,
      dataQuality: this.transformQuality(data.dataQuality),
      disclaimer: "This analysis is for educational and inspirational purposes only."
    };
  }
  
  // 強みを強調して拡張
  private static enhanceStrengths(data: CompetitorData): any[] {
    const strengths = [];
    
    // 既存の強みがあれば使用
    if (data.similarTools && data.similarTools.length > 0) {
      data.similarTools.forEach(tool => {
        if (tool.strength) {
          strengths.push({
            feature: tool.strength,
            description: `${data.name} excels in this area`,
            userBenefit: "Enhances user productivity and satisfaction",
            marketRecognition: "Widely recognized strength"
          });
        }
      });
    }
    
    // 基本的な強みを追加
    strengths.push({
      feature: "Established market presence",
      description: `${data.marketShare || 'Significant'} market share demonstrates trust`,
      userBenefit: "Proven reliability and community support",
      marketRecognition: "Industry recognized"
    });
    
    strengths.push({
      feature: "Active development",
      description: "Continuously evolving and improving",
      userBenefit: "Regular updates and new features",
      marketRecognition: "Commitment to innovation"
    });
    
    return strengths.slice(0, 5); // 最大5個
  }
  
  // 不満を改善機会に変換
  private static transformComplaints(complaints: UserComplaint[]): any[] {
    return complaints.map(complaint => ({
      area: this.makeRespectful(complaint.issue),
      currentApproach: `Currently handles this in a ${this.getPositiveAdjective()} way`,
      potentialEnhancement: `Opportunity to further optimize ${this.extractArea(complaint.issue)}`,
      userBenefit: `Would enhance user experience by ${complaint.frequency}%`,
      implementationPath: this.mapDifficultyToPath(complaint.severity)
    }));
  }
  
  // ギャップを市場機会に変換
  private static transformGaps(gaps: IndustryGap[]): any[] {
    return gaps.map(gap => ({
      opportunity: this.makeRespectful(gap.gap),
      marketNeed: gap.opportunity,
      potentialApproach: [
        "Innovative solution approach",
        "User-centric implementation",
        "Gradual feature rollout"
      ],
      estimatedImpact: `${gap.successProbability}% success potential`,
      inspiration: gap.claudeInsight || "Industry best practices suggest exploring this area"
    }));
  }
  
  // 成功事例を inspirational に変換
  private static transformSuccessStories(stories: SuccessStory[]): any[] {
    return stories.map(story => ({
      company: story.company,
      approach: story.action,
      outcome: this.makePositive(story.result),
      keyTakeaway: story.lessons[0] || "Innovation drives success",
      applicability: story.relevance
    }));
  }
  
  // テキストを敬意を持った表現に変換
  private static makeRespectful(text: string): string {
    let result = text;
    
    // 各ネガティブな用語を置換
    Object.entries(this.respectfulTerms).forEach(([negative, positive]) => {
      const regex = new RegExp(`\\b${negative}\\b`, 'gi');
      result = result.replace(regex, positive);
    });
    
    return result;
  }
  
  // ポジティブな形容詞を取得
  private static getPositiveAdjective(): string {
    const adjectives = [
      'unique', 'distinctive', 'thoughtful', 
      'considered', 'intentional', 'strategic'
    ];
    return adjectives[Math.floor(Math.random() * adjectives.length)];
  }
  
  // エリアを抽出
  private static extractArea(issue: string): string {
    // 簡単な解析で主要なエリアを特定
    if (issue.includes('performance') || issue.includes('slow')) return 'performance optimization';
    if (issue.includes('price') || issue.includes('expensive')) return 'value proposition';
    if (issue.includes('feature') || issue.includes('missing')) return 'feature enhancement';
    return 'user experience';
  }
  
  // 難易度をパスに変換
  private static mapDifficultyToPath(severity: string): string {
    switch(severity) {
      case 'low': return 'straightforward';
      case 'medium': return 'moderate';
      case 'high': return 'complex';
      default: return 'moderate';
    }
  }
  
  // 結果をポジティブに
  private static makePositive(result: string): string {
    // 数字を保持しつつ、表現をポジティブに
    return result.replace(/acquired/gi, 'successfully partnered')
                 .replace(/dominated/gi, 'achieved leadership')
                 .replace(/beat/gi, 'excelled beyond');
  }
  
  // データ品質を変換
  private static transformQuality(quality: string): 'comprehensive' | 'detailed' | 'essential' {
    switch(quality) {
      case 'high': return 'comprehensive';
      case 'medium': return 'detailed';
      case 'basic': return 'essential';
      default: return 'essential';
    }
  }
}