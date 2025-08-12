// =============================================================================
// CORE DATA TYPES
// =============================================================================

export interface CompetitorData {
  id: string;
  name: string;
  category: string;
  website: string;
  pricing: string;
  marketShare?: string;
  
  // Search optimization
  keywords: string[];
  aliases: string[];
  
  // Industry context
  similarTools: SimilarTool[];
  industryPosition: 'leader' | 'challenger' | 'niche' | 'emerging';
  
  // Action-oriented analysis
  userComplaints: UserComplaint[];
  industryGaps: IndustryGap[];
  actionStrategies: ActionStrategy[];
  successStories: SuccessStory[];
  
  // Metadata
  lastUpdated: string;
  dataQuality: 'high' | 'medium' | 'basic';
  communityVotes: number;
  userRequested: boolean;
  
  // Deep dive data (Pro feature)
  deepDive?: DeepDiveAnalysis;
}

export interface SimilarTool {
  id: string;
  name: string;
  pricing: string;
  strength: string;
  weakness: string;
  marketShare: string;
  similarity: number; // 0-100 similarity score
}

export interface UserComplaint {
  issue: string;
  frequency: number; // Percentage of reviews mentioning this
  severity: 'high' | 'medium' | 'low';
  source: 'G2' | 'Capterra' | 'TrustRadius' | 'Reddit' | 'Twitter' | 'Other';
  trends: 'increasing' | 'stable' | 'decreasing';
  examples: string[]; // Sample quotes
}

export interface IndustryGap {
  gap: string;
  affectedTools: string[]; // Multiple competitor IDs
  opportunity: string;
  claudeInsight: string; // AI strategic analysis
  marketImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  potential: 'low' | 'medium' | 'high' | 'very high';
  timeframe: string;
  successProbability: number; // 0-100
}

export interface ActionStrategy {
  strategy: string;
  description: string;
  reasoning: string;
  examples: string[]; // Real company examples
  timeline: string;
  difficulty: 'easy' | 'medium' | 'hard';
  resources: string[];
  priority: number; // 1-10
}

export interface SuccessStory {
  company: string;
  situation: string; // What problem they solved
  action: string; // How they solved it
  result: string; // Outcome
  timeline: string;
  lessons: string[];
  relevance: number; // 0-100 relevance to current analysis
}

// =============================================================================
// DEEP DIVE ANALYSIS (PRO FEATURES)
// =============================================================================

export interface DeepDiveAnalysis {
  userPersonas: UserPersona[];
  implementationRoadmap: RoadmapStep[];
  riskFactors: RiskFactor[];
  marketTiming: MarketTimingAnalysis;
  competitivePositioning: CompetitivePositioning;
  financialProjection: FinancialProjection;
}

export interface UserPersona {
  name: string;
  demographics: string;
  painPoints: string[];
  motivations: string[];
  behaviors: string[];
  willingnessToPay: number;
  influence: number; // How influential this persona is
}

export interface RoadmapStep {
  phase: string;
  duration: string;
  tasks: string[];
  milestones: string[];
  resources: string[];
  risks: string[];
  successMetrics: string[];
}

export interface RiskFactor {
  risk: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string[];
  earlyWarnings: string[];
}

export interface MarketTimingAnalysis {
  currentPhase: 'early' | 'growth' | 'mature' | 'declining';
  trends: string[];
  catalysts: string[];
  barriers: string[];
  optimalEntryTime: string;
  competitorReactionTime: string;
}

export interface CompetitivePositioning {
  positioning: string;
  differentiation: string[];
  messaging: string[];
  targetSegments: string[];
  pricingStrategy: string;
}

export interface FinancialProjection {
  revenueModel: string;
  targetPricing: string;
  marketSizeEstimate: string;
  customerAcquisitionCost: number;
  lifetimeValue: number;
  breakEvenTimeline: string;
  fundingRequirement: string;
}

// =============================================================================
// SEARCH & UI TYPES  
// =============================================================================

export interface SearchResult {
  tool: CompetitorData;
  score: number;
  matchedKeywords: string[];
  matchType: 'exact' | 'partial' | 'similar' | 'category';
}

export interface SearchFilters {
  categories: string[];
  difficulties: string[];
  potentials: string[];
  priceRanges: string[];
  dataQuality: string[];
  timeframes: string[];
}

export interface SearchSuggestion {
  term: string;
  type: 'tool' | 'category' | 'problem' | 'feature';
  resultsCount: number;
  trending: boolean;
  icon?: string;
}

// =============================================================================
// OFFLINE & SYNC TYPES
// =============================================================================

export interface OfflineStatus {
  isOnline: boolean;
  lastSync: Date;
  cachedTools: number;
  queuedActions: number;
  syncProgress?: number;
  storageUsed: number; // In MB
  storageLimit: number;
}

export interface SyncAction {
  id: string;
  type: 'search' | 'feedback' | 'request' | 'export';
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  retries: number;
}

// =============================================================================
// COMMUNITY & USER TYPES
// =============================================================================

export interface ToolRequest {
  id: string;
  toolName: string;
  description: string;
  category: string;
  requestedBy: string;
  priority: number; // Community votes
  status: 'requested' | 'in_progress' | 'completed' | 'rejected';
  estimatedCompletion?: string;
  submittedAt: Date;
  completedAt?: Date;
}

export interface UserFeedback {
  id: string;
  toolId: string;
  feedbackType: 'correction' | 'addition' | 'update' | 'complaint';
  content: string;
  verified: boolean;
  helpful: number; // Upvotes
  submittedBy: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  searchHistory: SearchHistoryItem[];
  favoriteTools: string[];
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultCount: number;
  clicked: boolean;
}

export interface NotificationSettings {
  newToolAlerts: boolean;
  requestUpdates: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

export interface PrivacySettings {
  shareSearchData: boolean;
  shareUsageAnalytics: boolean;
  allowCookies: boolean;
}

// =============================================================================
// API & EXPORT TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv' | 'markdown';
  includeDeepDive: boolean;
  includeSimilarTools: boolean;
  includeSuccessStories: boolean;
  branding: boolean;
  language: string;
}

export interface ExportResult {
  url: string;
  filename: string;
  size: number;
  expiresAt: Date;
}

// =============================================================================
// ANALYTICS & METRICS
// =============================================================================

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export interface UsageMetrics {
  searchesPerDay: number;
  averageSessionDuration: number;
  mostSearchedCategories: string[];
  conversionRate: number;
  retentionRate: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type TabType = 'complaints' | 'gaps' | 'industry' | 'similar' | 'strategies' | 'success';

export interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
  description: string;
  proFeature?: boolean;
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const CATEGORIES = [
  'Design', 'Development', 'Productivity', 'Communication', 'Marketing',
  'Analytics', 'Project Management', 'E-commerce', 'AI/ML', 'Finance',
  'HR', 'Customer Support', 'Sales', 'Education', 'Health', 'Other'
] as const;

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export const POTENTIALS = ['low', 'medium', 'high', 'very high'] as const;
export const DATA_QUALITIES = ['basic', 'medium', 'high'] as const;
export const SEVERITIES = ['low', 'medium', 'high'] as const;

export type Category = typeof CATEGORIES[number];
export type Difficulty = typeof DIFFICULTIES[number];
export type Potential = typeof POTENTIALS[number];
export type DataQuality = typeof DATA_QUALITIES[number];
export type Severity = typeof SEVERITIES[number];