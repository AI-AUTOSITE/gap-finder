'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Target, 
  DollarSign,
  Users,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb,
  Award,
  Filter,
  Calendar,
  ChevronRight,
  Eye,
  ThumbsUp,
  Flame,
  Shield,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import type { CompetitorData } from '@/types';

interface InsightsDashboardProps {
  tools: CompetitorData[];
  searchHistory?: string[];
  favorites?: string[];
}

interface Insight {
  id: string;
  type: 'opportunity' | 'trend' | 'alert' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedTools: string[];
  metrics?: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
  }[];
  actionItems?: string[];
  confidence: number;
}

export function InsightsDashboard({ 
  tools, 
  searchHistory = [], 
  favorites = [] 
}: InsightsDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  // Calculate insights
  useEffect(() => {
    const generatedInsights = generateInsights(tools, selectedCategory);
    setInsights(generatedInsights);
  }, [tools, selectedCategory]);

  // Calculate statistics
  const stats = useMemo(() => {
    const filteredTools = selectedCategory 
      ? tools.filter(t => t.category === selectedCategory)
      : tools;

    // Top complaints aggregation
    const allComplaints = new Map<string, { count: number; frequency: number; tools: string[] }>();
    filteredTools.forEach(tool => {
      tool.userComplaints.forEach(complaint => {
        const key = complaint.issue.toLowerCase();
        const existing = allComplaints.get(key) || { count: 0, frequency: 0, tools: [] };
        allComplaints.set(key, {
          count: existing.count + 1,
          frequency: existing.frequency + complaint.frequency,
          tools: [...existing.tools, tool.name]
        });
      });
    });

    // Top opportunities aggregation
    const allOpportunities = new Map<string, { count: number; potential: string[]; tools: string[] }>();
    filteredTools.forEach(tool => {
      tool.industryGaps.forEach(gap => {
        const key = gap.gap;
        const existing = allOpportunities.get(key) || { count: 0, potential: [], tools: [] };
        allOpportunities.set(key, {
          count: existing.count + 1,
          potential: [...existing.potential, gap.potential],
          tools: [...existing.tools, tool.name]
        });
      });
    });

    // Category distribution
    const categoryCount = new Map<string, number>();
    filteredTools.forEach(tool => {
      categoryCount.set(tool.category, (categoryCount.get(tool.category) || 0) + 1);
    });

    // Pricing analysis
    const pricingTiers = {
      free: 0,
      low: 0, // $0-10
      medium: 0, // $10-50
      high: 0, // $50+
    };
    
    filteredTools.forEach(tool => {
      if (tool.pricing.toLowerCase().includes('free')) {
        pricingTiers.free++;
      } else if (tool.pricing.includes('$')) {
        const price = parseInt(tool.pricing.match(/\$(\d+)/)?.[1] || '0');
        if (price <= 10) pricingTiers.low++;
        else if (price <= 50) pricingTiers.medium++;
        else pricingTiers.high++;
      }
    });

    return {
      totalTools: filteredTools.length,
      categories: categoryCount,
      topComplaints: Array.from(allComplaints.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5),
      topOpportunities: Array.from(allOpportunities.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5),
      pricingTiers,
      avgComplaintsPerTool: filteredTools.reduce((sum, t) => sum + t.userComplaints.length, 0) / filteredTools.length,
      avgOpportunitiesPerTool: filteredTools.reduce((sum, t) => sum + t.industryGaps.length, 0) / filteredTools.length
    };
  }, [tools, selectedCategory]);

  // Get categories
  const categories = Array.from(new Set(tools.map(t => t.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-7 w-7 text-blue-600" />
            Market Insights Dashboard
          </h2>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="all">All Time</option>
            </select>
            
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
            label="Tools Analyzed"
            value={stats.totalTools}
            trend="stable"
          />
          <MetricCard
            icon={<AlertCircle className="h-5 w-5 text-orange-600" />}
            label="Avg Complaints"
            value={stats.avgComplaintsPerTool.toFixed(1)}
            trend="down"
          />
          <MetricCard
            icon={<Target className="h-5 w-5 text-green-600" />}
            label="Avg Opportunities"
            value={stats.avgOpportunitiesPerTool.toFixed(1)}
            trend="up"
          />
          <MetricCard
            icon={<DollarSign className="h-5 w-5 text-purple-600" />}
            label="Free Tools"
            value={`${stats.pricingTiers.free}/${stats.totalTools}`}
            trend="stable"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Complaints */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Hottest User Complaints
          </h3>
          
          <div className="space-y-3">
            {stats.topComplaints.map(([complaint, data], index) => (
              <div key={complaint} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-red-100 text-red-700' :
                  index === 1 ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 capitalize">{complaint}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-600">
                      {data.count} tools affected
                    </span>
                    <span className="text-xs text-gray-600">
                      Avg frequency: {(data.frequency / data.count).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {data.tools.slice(0, 3).map(tool => (
                      <span key={tool} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                        {tool}
                      </span>
                    ))}
                    {data.tools.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{data.tools.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Opportunities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Biggest Market Opportunities
          </h3>
          
          <div className="space-y-3">
            {stats.topOpportunities.map(([opportunity, data], index) => (
              <div key={opportunity} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-green-100 text-green-700' :
                  index === 1 ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{opportunity}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-600">
                      {data.count} tools affected
                    </span>
                    <div className="flex gap-1">
                      {Array.from(new Set(data.potential)).map(p => (
                        <span key={p} className={`text-xs px-2 py-0.5 rounded-full ${
                          p === 'very high' ? 'bg-green-100 text-green-700' :
                          p === 'high' ? 'bg-blue-100 text-blue-700' :
                          p === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-500" />
            Category Distribution
          </h3>
          
          <div className="space-y-2">
            {Array.from(stats.categories.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => {
                const percentage = (count / stats.totalTools * 100).toFixed(0);
                return (
                  <div key={category} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                        <span className="text-sm text-gray-600">{count} tools ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Pricing Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Pricing Distribution
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <PricingTierCard
              label="Free"
              count={stats.pricingTiers.free}
              total={stats.totalTools}
              icon={<Shield className="h-5 w-5 text-green-600" />}
              color="green"
            />
            <PricingTierCard
              label="$0-10"
              count={stats.pricingTiers.low}
              total={stats.totalTools}
              icon={<DollarSign className="h-5 w-5 text-blue-600" />}
              color="blue"
            />
            <PricingTierCard
              label="$10-50"
              count={stats.pricingTiers.medium}
              total={stats.totalTools}
              icon={<DollarSign className="h-5 w-5 text-yellow-600" />}
              color="yellow"
            />
            <PricingTierCard
              label="$50+"
              count={stats.pricingTiers.high}
              total={stats.totalTools}
              icon={<DollarSign className="h-5 w-5 text-red-600" />}
              color="red"
            />
          </div>
        </div>
      </div>

      {/* AI-Generated Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          AI-Powered Strategic Insights
        </h3>
        
        <div className="space-y-4">
          {insights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              isExpanded={expandedInsights.has(insight.id)}
              onToggle={() => {
                const newExpanded = new Set(expandedInsights);
                if (newExpanded.has(insight.id)) {
                  newExpanded.delete(insight.id);
                } else {
                  newExpanded.add(insight.id);
                }
                setExpandedInsights(newExpanded);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ 
  icon, 
  label, 
  value, 
  trend 
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        {icon}
        {trend === 'up' && <ArrowUp className="h-4 w-4 text-green-500" />}
        {trend === 'down' && <ArrowDown className="h-4 w-4 text-red-500" />}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

// Pricing Tier Card Component
function PricingTierCard({ 
  label, 
  count, 
  total, 
  icon, 
  color 
}: {
  label: string;
  count: number;
  total: number;
  icon: React.ReactNode;
  color: string;
}) {
  const percentage = total > 0 ? (count / total * 100).toFixed(0) : 0;
  
  return (
    <div className={`bg-${color}-50 rounded-lg p-4 text-center`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{count}</p>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
    </div>
  );
}

// Insight Card Component
function InsightCard({ 
  insight, 
  isExpanded, 
  onToggle 
}: {
  insight: Insight;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const getPriorityColor = () => {
    switch (insight.priority) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-green-300 bg-green-50';
    }
  };

  const getTypeIcon = () => {
    switch (insight.type) {
      case 'opportunity': return <Target className="h-5 w-5 text-green-600" />;
      case 'trend': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'alert': return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default: return <Lightbulb className="h-5 w-5 text-purple-600" />;
    }
  };

  return (
    <div className={`border-l-4 rounded-lg p-4 ${getPriorityColor()}`}>
      <button
        onClick={onToggle}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getTypeIcon()}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{insight.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
              
              {insight.metrics && (
                <div className="flex gap-4 mt-2">
                  {insight.metrics.map((metric, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">{metric.label}:</span>
                      <span className="text-sm font-medium text-gray-900">{metric.value}</span>
                      {metric.trend === 'up' && <ArrowUp className="h-3 w-3 text-green-500" />}
                      {metric.trend === 'down' && <ArrowDown className="h-3 w-3 text-red-500" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`} />
        </div>
      </button>
      
      {isExpanded && (
        <div className="mt-3 ml-8 space-y-2">
          {insight.actionItems && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Action Items:</p>
              <ul className="space-y-1">
                {insight.actionItems.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-gray-500">Confidence:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${insight.confidence}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700">{insight.confidence}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Generate insights function
function generateInsights(tools: CompetitorData[], category: string | null): Insight[] {
  const insights: Insight[] = [];
  
  // Insight 1: Most common complaint pattern
  const complaintPattern = findComplaintPattern(tools);
  if (complaintPattern) {
    insights.push({
      id: 'complaint-pattern',
      type: 'opportunity',
      priority: 'high',
      title: `Major opportunity: ${complaintPattern.issue}`,
      description: `${complaintPattern.percentage}% of tools struggle with this issue, creating a significant market gap`,
      affectedTools: complaintPattern.tools,
      metrics: [
        { label: 'Tools affected', value: complaintPattern.tools.length },
        { label: 'Avg frequency', value: `${complaintPattern.avgFrequency}%` },
        { label: 'Market impact', value: 'High', trend: 'up' }
      ],
      actionItems: [
        'Build a solution specifically addressing this pain point',
        'Position as the faster/better alternative',
        'Target users frustrated with current options'
      ],
      confidence: 85
    });
  }
  
  // Insight 2: Underserved category
  const underserved = findUnderservedCategory(tools);
  if (underserved) {
    insights.push({
      id: 'underserved-category',
      type: 'trend',
      priority: 'medium',
      title: `${underserved.category} is underserved`,
      description: 'This category has fewer tools but high opportunity density',
      affectedTools: underserved.tools,
      metrics: [
        { label: 'Tool count', value: underserved.toolCount },
        { label: 'Opportunities', value: underserved.opportunityCount },
        { label: 'Growth potential', value: 'High', trend: 'up' }
      ],
      actionItems: [
        'Consider entering this less competitive space',
        'Research specific user needs in this category',
        'Build category-specific features'
      ],
      confidence: 75
    });
  }
  
  // Insight 3: Pricing opportunity
  const pricingGap = findPricingGap(tools);
  if (pricingGap) {
    insights.push({
      id: 'pricing-gap',
      type: 'recommendation',
      priority: pricingGap.priority as 'high' | 'medium' | 'low',
      title: pricingGap.title,
      description: pricingGap.description,
      affectedTools: pricingGap.tools,
      metrics: pricingGap.metrics,
      actionItems: pricingGap.actionItems,
      confidence: pricingGap.confidence
    });
  }
  
  return insights;
}

// Helper functions for insight generation
function findComplaintPattern(tools: CompetitorData[]) {
  const complaints = new Map<string, { count: number; frequency: number; tools: string[] }>();
  
  tools.forEach(tool => {
    tool.userComplaints.forEach(complaint => {
      const key = complaint.issue.toLowerCase();
      const existing = complaints.get(key) || { count: 0, frequency: 0, tools: [] };
      complaints.set(key, {
        count: existing.count + 1,
        frequency: existing.frequency + complaint.frequency,
        tools: [...existing.tools, tool.name]
      });
    });
  });
  
  const sorted = Array.from(complaints.entries()).sort((a, b) => b[1].count - a[1].count);
  if (sorted.length > 0 && sorted[0][1].count >= 3) {
    const [issue, data] = sorted[0];
    return {
      issue,
      percentage: Math.round((data.count / tools.length) * 100),
      avgFrequency: Math.round(data.frequency / data.count),
      tools: data.tools
    };
  }
  
  return null;
}

function findUnderservedCategory(tools: CompetitorData[]) {
  const categories = new Map<string, { tools: string[]; opportunities: number }>();
  
  tools.forEach(tool => {
    const existing = categories.get(tool.category) || { tools: [], opportunities: 0 };
    categories.set(tool.category, {
      tools: [...existing.tools, tool.name],
      opportunities: existing.opportunities + tool.industryGaps.length
    });
  });
  
  const sorted = Array.from(categories.entries())
    .map(([cat, data]) => ({
      category: cat,
      toolCount: data.tools.length,
      opportunityCount: data.opportunities,
      opportunityDensity: data.opportunities / data.tools.length,
      tools: data.tools
    }))
    .sort((a, b) => b.opportunityDensity - a.opportunityDensity);
  
  if (sorted.length > 0 && sorted[0].toolCount <= 3) {
    return sorted[0];
  }
  
  return null;
}

function findPricingGap(tools: CompetitorData[]) {
  const freeCount = tools.filter(t => t.pricing.toLowerCase().includes('free')).length;
  const freePercentage = (freeCount / tools.length) * 100;
  
  if (freePercentage < 20) {
    return {
      title: 'Free tier opportunity',
      description: 'Very few tools offer free plans, creating an entry opportunity',
      tools: tools.filter(t => !t.pricing.toLowerCase().includes('free')).map(t => t.name),
      priority: 'high',
      metrics: [
        { label: 'Free tools', value: `${freeCount}/${tools.length}` },
        { label: 'Market gap', value: `${(100 - freePercentage).toFixed(0)}%` }
      ],
      actionItems: [
        'Launch with generous free tier',
        'Use freemium model for rapid growth',
        'Convert free users to paid over time'
      ],
      confidence: 80
    };
  }
  
  return null;
}