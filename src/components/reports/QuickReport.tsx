'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  DollarSign,
  Clock,
  Target,
  Sparkles,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import type { CompetitorData } from '@/types';

interface QuickReportProps {
  tool: CompetitorData;
  onClose?: () => void;
}

export function QuickReport({ tool, onClose }: QuickReportProps) {
  const [report, setReport] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [reportType, setReportType] = useState<'executive' | 'technical' | 'investor'>('executive');

  useEffect(() => {
    generateReport();
  }, [tool, reportType]);

  const generateReport = () => {
    const date = new Date().toLocaleDateString();
    
    // 分析スコアを計算
    const opportunityScore = tool.industryGaps.reduce((sum, gap) => {
      const potentialScore = gap.potential === 'very high' ? 4 : 
                            gap.potential === 'high' ? 3 : 
                            gap.potential === 'medium' ? 2 : 1;
      return sum + potentialScore * (gap.successProbability || 50) / 100;
    }, 0);
    
    const problemScore = tool.userComplaints.reduce((sum, complaint) => 
      sum + complaint.frequency, 0
    ) / tool.userComplaints.length;
    
    // レポートタイプに応じた内容生成
    let reportContent = '';
    
    if (reportType === 'executive') {
      reportContent = `
# Executive Summary: ${tool.name} Gap Analysis

**Date:** ${date}  
**Category:** ${tool.category}  
**Current Pricing:** ${tool.pricing}  
**Market Position:** ${tool.marketShare || 'Data not available'}

## 🎯 Key Findings

### Market Opportunity Score: ${(opportunityScore * 10).toFixed(1)}/10
${tool.name} presents ${opportunityScore > 7 ? 'exceptional' : opportunityScore > 5 ? 'strong' : 'moderate'} opportunities for disruption.

### Top 3 Market Gaps
${tool.industryGaps.slice(0, 3).map((gap, i) => 
`${i + 1}. **${gap.gap}**
   - Potential: ${gap.potential}
   - Success Rate: ${gap.successProbability}%
   - Implementation: ${gap.difficulty}`
).join('\n')}

### Critical User Pain Points
- **Average Complaint Frequency:** ${problemScore.toFixed(0)}% of users
- **Most Critical Issue:** ${tool.userComplaints[0]?.issue || 'None identified'}
- **Severity Level:** ${tool.userComplaints[0]?.severity || 'Low'}

## 💡 Strategic Recommendations

1. **Quick Win Opportunity**
   Focus on ${tool.industryGaps.find(g => g.difficulty === 'easy')?.gap || 'performance improvements'}
   
2. **Differentiation Strategy**
   Position as the solution to "${tool.userComplaints[0]?.issue || 'current limitations'}"
   
3. **Market Entry Timing**
   ${opportunityScore > 7 ? 'Immediate action recommended' : 'Strategic planning phase advised'}

## 🏆 Competitive Advantage
Build a ${tool.category.toLowerCase()} that specifically addresses the ${problemScore.toFixed(0)}% of users frustrated with current solutions.

---
*This report is for strategic planning purposes only.*
      `;
    } else if (reportType === 'technical') {
      reportContent = `
# Technical Gap Analysis: ${tool.name}

**Analysis Date:** ${date}  
**Tool Category:** ${tool.category}  
**Current Architecture:** Web-based SaaS

## 🔧 Technical Opportunities

### Performance Issues (${tool.userComplaints.filter(c => c.issue.toLowerCase().includes('slow') || c.issue.toLowerCase().includes('performance')).length} reported)
${tool.userComplaints
  .filter(c => c.issue.toLowerCase().includes('slow') || c.issue.toLowerCase().includes('performance'))
  .map(c => `- ${c.issue} (${c.frequency}% users affected)`)
  .join('\n') || '- No performance issues reported'}

### Feature Gaps
${tool.industryGaps.map(gap => 
`**${gap.gap}**
- Technical Difficulty: ${gap.difficulty}
- Implementation Estimate: ${gap.difficulty === 'easy' ? '1-2 months' : gap.difficulty === 'medium' ? '3-6 months' : '6-12 months'}
- Success Probability: ${gap.successProbability}%`
).join('\n\n')}

### Recommended Tech Stack
Based on identified gaps:
- **Frontend:** ${tool.userComplaints.some(c => c.issue.includes('slow')) ? 'React/Next.js with SSG' : 'Any modern framework'}
- **Backend:** ${tool.industryGaps.some(g => g.gap.includes('offline')) ? 'Edge functions + Service Workers' : 'Traditional API'}
- **Database:** ${tool.industryGaps.some(g => g.gap.includes('real-time')) ? 'PostgreSQL + Redis' : 'PostgreSQL'}
- **Infrastructure:** ${tool.userComplaints.some(c => c.frequency > 30) ? 'Multi-region CDN required' : 'Standard cloud hosting'}

## 🚀 Implementation Priority
1. Address performance bottlenecks first
2. Implement offline capability if missing
3. Add real-time features for collaboration
4. Build API for integrations

---
*Technical recommendations based on market analysis.*
      `;
    } else {
      // Investor report
      const marketSize = tool.marketShare ? parseInt(tool.marketShare.replace('%', '')) : 10;
      const tam = marketSize * 100; // Simplified TAM calculation
      
      reportContent = `
# Investment Opportunity: ${tool.name} Disruption

**Date:** ${date}  
**Market:** ${tool.category}  
**Incumbent Pricing:** ${tool.pricing}

## 📈 Market Analysis

### Total Addressable Market (TAM)
- **Current Market Share:** ${tool.marketShare || 'Estimated 10%'}
- **Estimated TAM:** $${tam}M+ annually
- **Growth Rate:** 25-30% YoY (industry average)

### Disruption Potential
**Score: ${(opportunityScore * 2.5).toFixed(1)}/10**

Key Indicators:
- User dissatisfaction rate: ${problemScore.toFixed(0)}%
- Identified opportunities: ${tool.industryGaps.length}
- Similar tools in market: ${tool.similarTools.length}

### Investment Thesis
${opportunityScore > 7 ? 
`**Strong Buy Opportunity**
Multiple high-potential gaps identified with clear path to monetization.` :
opportunityScore > 5 ?
`**Moderate Opportunity**
Solid market gaps exist but execution risk is moderate.` :
`**Early Stage**
Market needs further validation before significant investment.`}

### Revenue Model Recommendations
1. **Freemium Model**
   - Free: Basic features
   - Pro: $${Math.round(parseInt(tool.pricing.match(/\d+/)?.[0] || '20') * 0.7)}/month
   - Team: $${Math.round(parseInt(tool.pricing.match(/\d+/)?.[0] || '20') * 1.5)}/month

2. **Market Penetration Strategy**
   - Target the ${problemScore.toFixed(0)}% dissatisfied users
   - Projected conversion: 2-3% in Year 1
   - LTV/CAC ratio: 3:1 expected

### Risk Assessment
- **Competition Risk:** ${tool.similarTools.length > 5 ? 'High' : tool.similarTools.length > 2 ? 'Medium' : 'Low'}
- **Technical Risk:** ${tool.industryGaps.some(g => g.difficulty === 'hard') ? 'High' : 'Medium'}
- **Market Risk:** ${problemScore < 20 ? 'High' : problemScore < 40 ? 'Medium' : 'Low'}

## 🎯 Exit Strategy
- **Acquisition Target:** Major players in ${tool.category} space
- **Timeline:** 3-5 years
- **Multiple:** 5-10x revenue

---
*Investment analysis for informational purposes only. Not financial advice.*
      `;
    }
    
    setReport(reportContent);
  };

  const copyReport = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: `Gap Analysis: ${tool.name}`,
        text: report
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Quick Analysis Report</h2>
                <p className="text-sm text-gray-600">{tool.name} - {tool.category}</p>
              </div>
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          
          {/* Report Type Selector */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setReportType('executive')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                reportType === 'executive' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setReportType('technical')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                reportType === 'technical' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Technical Analysis
            </button>
            <button
              onClick={() => setReportType('investor')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                reportType === 'investor' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Investment View
            </button>
          </div>
        </div>
        
        {/* Report Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ 
              __html: report.replace(/\n/g, '<br/>').replace(/#{1,3} /g, '<h3 class="font-bold text-lg mt-4 mb-2">').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }} />
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Generated just now</span>
              <span className="text-gray-400">•</span>
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>AI-powered analysis</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={copyReport}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
              
              <button
                onClick={shareReport}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}