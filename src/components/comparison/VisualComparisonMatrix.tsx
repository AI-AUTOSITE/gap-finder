import React, { useState, useMemo, useEffect } from 'react';
import { 
  Check, 
  X, 
  AlertCircle, 
  TrendingUp, 
  DollarSign,
  Star,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Filter,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';

// Type definitions
interface Tool {
  id: string;
  name: string;
  category: string;
  pricing: string;
  marketShare?: string;
  rating?: number;
  features: Record<string, boolean | string>;
  complaints: { issue: string; frequency: number; severity: string }[];
  opportunities: { gap: string; potential: string; difficulty: string }[];
}

// Sample data
const sampleTools: Tool[] = [
  {
    id: 'canva',
    name: 'Canva',
    category: 'Design Tool',
    pricing: 'Free - $15/month',
    marketShare: '35%',
    rating: 4.7,
    features: {
      'Offline Mode': false,
      'Real-time Collaboration': true,
      'Template Library': '500K+',
      'Export Formats': 'Multiple',
      'Mobile App': true,
      'API Access': 'Pro only',
      'Custom Fonts': true,
      'Stock Photos': '1M+',
      'Video Editing': true,
      'Brand Kit': 'Pro only'
    },
    complaints: [
      { issue: 'Slow loading', frequency: 34, severity: 'high' },
      { issue: 'No offline mode', frequency: 28, severity: 'high' },
      { issue: 'Limited customization', frequency: 22, severity: 'medium' }
    ],
    opportunities: [
      { gap: 'Offline Support', potential: 'very high', difficulty: 'medium' },
      { gap: 'Speed Optimization', potential: 'high', difficulty: 'easy' }
    ]
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'Design Tool',
    pricing: 'Free - $15/month',
    marketShare: '25%',
    rating: 4.8,
    features: {
      'Offline Mode': false,
      'Real-time Collaboration': true,
      'Template Library': '10K+',
      'Export Formats': 'Multiple',
      'Mobile App': false,
      'API Access': true,
      'Custom Fonts': true,
      'Stock Photos': false,
      'Video Editing': false,
      'Brand Kit': true
    },
    complaints: [
      { issue: 'Performance issues', frequency: 48, severity: 'high' },
      { issue: 'No offline mode', frequency: 35, severity: 'medium' }
    ],
    opportunities: [
      { gap: 'Native Performance', potential: 'high', difficulty: 'hard' }
    ]
  },
  {
    id: 'sketch',
    name: 'Sketch',
    category: 'Design Tool',
    pricing: '$99/year',
    marketShare: '10%',
    rating: 4.5,
    features: {
      'Offline Mode': true,
      'Real-time Collaboration': false,
      'Template Library': '5K+',
      'Export Formats': 'Multiple',
      'Mobile App': false,
      'API Access': true,
      'Custom Fonts': true,
      'Stock Photos': false,
      'Video Editing': false,
      'Brand Kit': true
    },
    complaints: [
      { issue: 'Mac only', frequency: 65, severity: 'high' },
      { issue: 'No web version', frequency: 42, severity: 'high' }
    ],
    opportunities: [
      { gap: 'Cross-platform', potential: 'very high', difficulty: 'hard' }
    ]
  }
];

export default function VisualComparisonMatrix() {
  const [selectedTools, setSelectedTools] = useState<Tool[]>(sampleTools);
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic', 'features', 'problems', 'opportunities'])
  );
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating' | 'marketShare'>('name');

  // Calculate comparison scores
  const comparisonScores = useMemo(() => {
    const scores: Record<string, number> = {};
    
    selectedTools.forEach(tool => {
      let score = 0;
      
      // Price score
      if (tool.pricing.toLowerCase().includes('free')) score += 30;
      
      // Feature score
      const featureCount = Object.values(tool.features).filter(v => v === true || (typeof v === 'string' && v !== 'false')).length;
      score += featureCount * 5;
      
      // Market share score
      const share = parseInt(tool.marketShare?.replace('%', '') || '0');
      score += share;
      
      // Rating score
      score += (tool.rating || 0) * 10;
      
      // Opportunity score
      tool.opportunities.forEach(opp => {
        if (opp.potential === 'very high') score += 10;
        else if (opp.potential === 'high') score += 7;
      });
      
      scores[tool.id] = Math.round(score);
    });
    
    return scores;
  }, [selectedTools]);

  // Get winner for each category
  const getWinner = (category: string): string | null => {
    if (!highlightDifferences) return null;
    
    switch (category) {
      case 'price':
        const freeTool = selectedTools.find(t => t.pricing.toLowerCase().includes('free'));
        return freeTool?.id || null;
      case 'rating':
        const topRated = selectedTools.reduce((best, tool) => 
          (tool.rating || 0) > (best.rating || 0) ? tool : best
        );
        return topRated.id;
      case 'marketShare':
        const leader = selectedTools.reduce((best, tool) => {
          const shareA = parseInt(best.marketShare?.replace('%', '') || '0');
          const shareB = parseInt(tool.marketShare?.replace('%', '') || '0');
          return shareB > shareA ? tool : best;
        });
        return leader.id;
      default:
        return null;
    }
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Export comparison
  const exportComparison = () => {
    const data = {
      tools: selectedTools.map(t => ({
        name: t.name,
        pricing: t.pricing,
        marketShare: t.marketShare,
        rating: t.rating,
        score: comparisonScores[t.id]
      })),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gap-finder-comparison.json';
    a.click();
  };

  // Render feature value
  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) {
      return <Check className="h-5 w-5 text-green-600" />;
    } else if (value === false) {
      return <X className="h-5 w-5 text-gray-400" />;
    } else {
      return <span className="text-sm font-medium text-gray-700">{value}</span>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Visual Comparison Matrix
          </h2>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportComparison}
              className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Export Comparison"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Share Comparison"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={highlightDifferences}
              onChange={(e) => setHighlightDifferences(e.target.checked)}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">Highlight Winners</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyDifferences}
              onChange={(e) => setShowOnlyDifferences(e.target.checked)}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">Show Only Differences</span>
          </label>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="rating">Sort by Rating</option>
            <option value="marketShare">Sort by Market Share</option>
          </select>
        </div>
      </div>

      {/* Comparison Scores */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Comparison Score</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedTools.map((tool, index) => {
            const score = comparisonScores[tool.id];
            const isWinner = Math.max(...Object.values(comparisonScores)) === score;
            
            return (
              <div key={tool.id} className="bg-white rounded-lg p-4 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                  isWinner ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {isWinner ? <Star className="h-6 w-6" /> : <span className="font-bold">{index + 1}</span>}
                </div>
                <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                <p className="text-2xl font-bold text-blue-600">{score}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                  Criteria
                </th>
                {selectedTools.map(tool => (
                  <th key={tool.id} className="p-4 text-center">
                    <div className="font-semibold text-gray-900">{tool.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{tool.category}</div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {/* Basic Information */}
              <ComparisonSection
                title="Basic Information"
                isExpanded={expandedSections.has('basic')}
                onToggle={() => toggleSection('basic')}
              >
                <ComparisonRow label="Pricing" winner={getWinner('price')}>
                  {selectedTools.map(tool => (
                    <td key={tool.id} className={`p-4 text-center ${
                      getWinner('price') === tool.id && highlightDifferences ? 'bg-green-50' : ''
                    }`}>
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{tool.pricing}</span>
                      </div>
                    </td>
                  ))}
                </ComparisonRow>
                
                <ComparisonRow label="Market Share" winner={getWinner('marketShare')}>
                  {selectedTools.map(tool => (
                    <td key={tool.id} className={`p-4 text-center ${
                      getWinner('marketShare') === tool.id && highlightDifferences ? 'bg-blue-50' : ''
                    }`}>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {tool.marketShare || 'N/A'}
                      </span>
                    </td>
                  ))}
                </ComparisonRow>
                
                <ComparisonRow label="User Rating" winner={getWinner('rating')}>
                  {selectedTools.map(tool => (
                    <td key={tool.id} className={`p-4 text-center ${
                      getWinner('rating') === tool.id && highlightDifferences ? 'bg-yellow-50' : ''
                    }`}>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{tool.rating || 'N/A'}</span>
                      </div>
                    </td>
                  ))}
                </ComparisonRow>
              </ComparisonSection>

              {/* Features */}
              <ComparisonSection
                title="Features"
                isExpanded={expandedSections.has('features')}
                onToggle={() => toggleSection('features')}
              >
                {Object.keys(selectedTools[0].features).map(feature => {
                  const values = selectedTools.map(t => t.features[feature]);
                  const allSame = values.every(v => v === values[0]);
                  
                  if (showOnlyDifferences && allSame) return null;
                  
                  return (
                    <ComparisonRow key={feature} label={feature}>
                      {selectedTools.map(tool => (
                        <td key={tool.id} className="p-4 text-center">
                          {renderFeatureValue(tool.features[feature])}
                        </td>
                      ))}
                    </ComparisonRow>
                  );
                })}
              </ComparisonSection>

              {/* Top Complaints */}
              <ComparisonSection
                title="Top User Complaints"
                isExpanded={expandedSections.has('problems')}
                onToggle={() => toggleSection('problems')}
              >
                {[0, 1, 2].map(index => (
                  <ComparisonRow key={index} label={`Issue #${index + 1}`}>
                    {selectedTools.map(tool => {
                      const complaint = tool.complaints[index];
                      if (!complaint) {
                        return <td key={tool.id} className="p-4 text-center text-gray-400">-</td>;
                      }
                      
                      return (
                        <td key={tool.id} className="p-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                complaint.severity === 'high' ? 'bg-red-100 text-red-700' :
                                complaint.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {complaint.frequency}%
                              </span>
                            </div>
                            <p className="text-gray-600 text-xs">{complaint.issue}</p>
                          </div>
                        </td>
                      );
                    })}
                  </ComparisonRow>
                ))}
              </ComparisonSection>

              {/* Opportunities */}
              <ComparisonSection
                title="Market Opportunities"
                isExpanded={expandedSections.has('opportunities')}
                onToggle={() => toggleSection('opportunities')}
              >
                <ComparisonRow label="Opportunity Count">
                  {selectedTools.map(tool => (
                    <td key={tool.id} className="p-4 text-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {tool.opportunities.length}
                      </span>
                    </td>
                  ))}
                </ComparisonRow>
                
                <ComparisonRow label="Top Opportunity">
                  {selectedTools.map(tool => {
                    const topOpp = tool.opportunities[0];
                    if (!topOpp) {
                      return <td key={tool.id} className="p-4 text-center text-gray-400">-</td>;
                    }
                    
                    return (
                      <td key={tool.id} className="p-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 mb-1">{topOpp.gap}</p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              topOpp.potential === 'very high' ? 'bg-green-100 text-green-700' :
                              topOpp.potential === 'high' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {topOpp.potential}
                            </span>
                            <span className="text-xs text-gray-500">{topOpp.difficulty}</span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </ComparisonRow>
              </ComparisonSection>
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedTools.map(tool => (
            <RadarChart key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ComparisonSection({ 
  title, 
  isExpanded, 
  onToggle, 
  children 
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <tr className="bg-gray-50 border-y">
        <td colSpan={100} className="p-0">
          <button
            onClick={onToggle}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="font-semibold text-gray-900">{title}</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </td>
      </tr>
      {isExpanded && children}
    </>
  );
}

function ComparisonRow({ 
  label, 
  winner,
  children 
}: {
  label: string;
  winner?: string | null;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white z-10">
        {label}
      </td>
      {children}
    </tr>
  );
}

function RadarChart({ tool }: { tool: Tool }) {
  // Simple visual representation
  const metrics = {
    Features: Object.values(tool.features).filter(v => v === true).length * 10,
    Price: tool.pricing.includes('Free') ? 100 : 50,
    Market: parseInt(tool.marketShare?.replace('%', '') || '0') * 2,
    Rating: (tool.rating || 0) * 20,
    Support: 100 - (tool.complaints[0]?.frequency || 0)
  };
  
  return (
    <div className="text-center">
      <h4 className="font-semibold text-gray-900 mb-3">{tool.name}</h4>
      <div className="space-y-2">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-16 text-right">{key}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, value)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8">{Math.round(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}