'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Check, 
  AlertCircle, 
  TrendingUp, 
  DollarSign,
  Users,
  Zap,
  Shield,
  Star,
  Download,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { CompetitorData } from '@/types';

interface ComparisonTableProps {
  tools: CompetitorData[];
  onRemove?: (toolId: string) => void;
  onAdd?: () => void;
  maxTools?: number;
}

export function ComparisonTable({ 
  tools, 
  onRemove, 
  onAdd,
  maxTools = 4 
}: ComparisonTableProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic', 'pricing', 'problems', 'opportunities'])
  );
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [comparisonScore, setComparisonScore] = useState<Record<string, number>>({});

  // 比較スコアを計算
  useEffect(() => {
    const scores: Record<string, number> = {};
    
    tools.forEach(tool => {
      let score = 0;
      
      // 価格スコア（安いほど高得点）
      if (tool.pricing.toLowerCase().includes('free')) score += 30;
      else if (tool.pricing.includes('$')) {
        const price = parseInt(tool.pricing.match(/\$(\d+)/)?.[1] || '100');
        score += Math.max(0, 30 - price / 5);
      }
      
      // 市場シェアスコア
      const share = parseInt(tool.marketShare?.replace('%', '') || '0');
      score += share / 2;
      
      // 機会スコア
      tool.industryGaps.forEach(gap => {
        if (gap.potential === 'very high') score += 10;
        else if (gap.potential === 'high') score += 7;
        else if (gap.potential === 'medium') score += 5;
      });
      
      // 問題の少なさスコア
      const avgComplaintFreq = tool.userComplaints.reduce((sum, c) => sum + c.frequency, 0) / 
                               (tool.userComplaints.length || 1);
      score += Math.max(0, 20 - avgComplaintFreq / 5);
      
      scores[tool.id] = Math.round(score);
    });
    
    setComparisonScore(scores);
  }, [tools]);

  // セクションの展開/折りたたみ
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // 勝者を判定
  const getWinner = (category: string, getValue: (tool: CompetitorData) => number): string | null => {
    if (!highlightDifferences || tools.length < 2) return null;
    
    let bestTool: string | null = null;
    let bestValue = -Infinity;
    
    tools.forEach(tool => {
      const value = getValue(tool);
      if (value > bestValue) {
        bestValue = value;
        bestTool = tool.id;
      }
    });
    
    return bestTool;
  };

  // エクスポート機能
  const exportComparison = () => {
    const data = tools.map(tool => ({
      Name: tool.name,
      Category: tool.category,
      Pricing: tool.pricing,
      'Market Share': tool.marketShare || 'N/A',
      'Top Complaints': tool.userComplaints.slice(0, 3).map(c => c.issue).join('; '),
      'Top Opportunities': tool.industryGaps.slice(0, 2).map(g => g.gap).join('; '),
      'Comparison Score': comparisonScore[tool.id] || 0
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tool-comparison.csv';
    a.click();
  };

  if (tools.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Tools Selected for Comparison
          </h3>
          <p className="text-gray-600 mb-4">
            Add tools to compare their features, pricing, and opportunities side by side.
          </p>
          {onAdd && (
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Tools to Compare
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header Controls */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Comparing {tools.length} Tools
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Highlight Winners</span>
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={exportComparison}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Export Comparison"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Share Comparison"
            >
              <Share2 className="h-5 w-5" />
            </button>
            {onAdd && tools.length < maxTools && (
              <button
                onClick={onAdd}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Add Tool
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Score Summary */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tools.map(tool => {
            const score = comparisonScore[tool.id] || 0;
            const isWinner = Math.max(...Object.values(comparisonScore)) === score;
            
            return (
              <div key={tool.id} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                  isWinner ? 'bg-gold-100 text-gold-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {isWinner ? <Star className="h-6 w-6" /> : <span className="font-bold">{score}</span>}
                </div>
                <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                <p className="text-sm text-gray-600">Score: {score}/100</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4 font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                Criteria
              </th>
              {tools.map(tool => (
                <th key={tool.id} className="p-4 text-center relative">
                  <div className="font-semibold text-gray-900">{tool.name}</div>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(tool.id)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {/* Basic Information Section */}
            <ComparisonSection
              title="Basic Information"
              sectionId="basic"
              isExpanded={expandedSections.has('basic')}
              onToggle={() => toggleSection('basic')}
            >
              <ComparisonRow label="Category">
                {tools.map(tool => (
                  <td key={tool.id} className="p-4 text-center">
                    {tool.category}
                  </td>
                ))}
              </ComparisonRow>
              
              <ComparisonRow label="Market Position">
                {tools.map(tool => (
                  <td key={tool.id} className="p-4 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {tool.marketShare || 'N/A'}
                    </span>
                  </td>
                ))}
              </ComparisonRow>
              
              <ComparisonRow label="Website">
                {tools.map(tool => (
                  <td key={tool.id} className="p-4 text-center">
                    <a 
                      href={tool.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Visit →
                    </a>
                  </td>
                ))}
              </ComparisonRow>
            </ComparisonSection>

            {/* Pricing Section */}
            <ComparisonSection
              title="Pricing"
              sectionId="pricing"
              isExpanded={expandedSections.has('pricing')}
              onToggle={() => toggleSection('pricing')}
            >
              <ComparisonRow 
                label="Price Range"
                winner={getWinner('price', tool => 
                  tool.pricing.toLowerCase().includes('free') ? 100 : 
                  100 - parseInt(tool.pricing.match(/\$(\d+)/)?.[1] || '100')
                )}
              >
                {tools.map(tool => {
                  const isWinner = getWinner('price', t => 
                    t.pricing.toLowerCase().includes('free') ? 100 : 
                    100 - parseInt(t.pricing.match(/\$(\d+)/)?.[1] || '100')
                  ) === tool.id;
                  
                  return (
                    <td key={tool.id} className={`p-4 text-center ${
                      isWinner && highlightDifferences ? 'bg-green-50' : ''
                    }`}>
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{tool.pricing}</span>
                        {isWinner && highlightDifferences && (
                          <span className="text-green-600">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </ComparisonRow>
            </ComparisonSection>

            {/* Problems Section */}
            <ComparisonSection
              title="Top User Complaints"
              sectionId="problems"
              isExpanded={expandedSections.has('problems')}
              onToggle={() => toggleSection('problems')}
            >
              {[0, 1, 2].map(index => (
                <ComparisonRow key={index} label={`Issue #${index + 1}`}>
                  {tools.map(tool => {
                    const complaint = tool.userComplaints[index];
                    if (!complaint) {
                      return (
                        <td key={tool.id} className="p-4 text-center text-gray-400">
                          -
                        </td>
                      );
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

            {/* Opportunities Section */}
            <ComparisonSection
              title="Market Opportunities"
              sectionId="opportunities"
              isExpanded={expandedSections.has('opportunities')}
              onToggle={() => toggleSection('opportunities')}
            >
              <ComparisonRow label="Total Opportunities">
                {tools.map(tool => {
                  const isWinner = getWinner('opportunities', t => t.industryGaps.length) === tool.id;
                  
                  return (
                    <td key={tool.id} className={`p-4 text-center ${
                      isWinner && highlightDifferences ? 'bg-green-50' : ''
                    }`}>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {tool.industryGaps.length}
                        </span>
                        {isWinner && highlightDifferences && (
                          <span className="text-green-600">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </ComparisonRow>
              
              <ComparisonRow label="Top Opportunity">
                {tools.map(tool => {
                  const topGap = tool.industryGaps[0];
                  if (!topGap) {
                    return (
                      <td key={tool.id} className="p-4 text-center text-gray-400">
                        -
                      </td>
                    );
                  }
                  
                  return (
                    <td key={tool.id} className="p-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 mb-1">{topGap.gap}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            topGap.potential === 'very high' ? 'bg-green-100 text-green-700' :
                            topGap.potential === 'high' ? 'bg-blue-100 text-blue-700' :
                            topGap.potential === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {topGap.potential}
                          </span>
                          <span className="text-xs text-gray-500">
                            {topGap.difficulty}
                          </span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </ComparisonRow>
            </ComparisonSection>

            {/* Similar Tools Section */}
            <ComparisonSection
              title="Alternative Tools"
              sectionId="alternatives"
              isExpanded={expandedSections.has('alternatives')}
              onToggle={() => toggleSection('alternatives')}
            >
              <ComparisonRow label="Similar Tools Count">
                {tools.map(tool => (
                  <td key={tool.id} className="p-4 text-center">
                    <span className="text-lg font-semibold text-gray-900">
                      {tool.similarTools.length}
                    </span>
                  </td>
                ))}
              </ComparisonRow>
              
              <ComparisonRow label="Top Alternatives">
                {tools.map(tool => (
                  <td key={tool.id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {tool.similarTools.slice(0, 3).map(similar => (
                        <span key={similar.id} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {similar.name}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </ComparisonRow>
            </ComparisonSection>
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Based on comparison analysis</p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">
                Best Overall: {
                  tools.find(t => t.id === Object.entries(comparisonScore)
                    .sort((a, b) => b[1] - a[1])[0]?.[0])?.name || 'N/A'
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-700">
                Best Value: {
                  tools.find(t => t.pricing.toLowerCase().includes('free'))?.name || 
                  tools.sort((a, b) => {
                    const priceA = parseInt(a.pricing.match(/\$(\d+)/)?.[1] || '999');
                    const priceB = parseInt(b.pricing.match(/\$(\d+)/)?.[1] || '999');
                    return priceA - priceB;
                  })[0]?.name
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Section Component
function ComparisonSection({ 
  title, 
  sectionId,
  isExpanded, 
  onToggle, 
  children 
}: {
  title: string;
  sectionId: string;
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

// Row Component
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