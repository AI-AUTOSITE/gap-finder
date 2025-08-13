// src/components/reports/AIReportGenerator.tsx
'use client';

import { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  DollarSign,
  Clock,
  Target,
  Sparkles,
  Download,
  Copy,
  Check,
  Loader2,
  Users,
  Zap,
  Shield,
  ChevronRight,
  BarChart3,
  Award
} from 'lucide-react';
import type { CompetitorData } from '@/types';

// Report types available
type ReportType = 'executive' | 'technical' | 'investor' | 'founder' | 'marketer';

interface ReportTemplate {
  id: ReportType;
  name: string;
  description: string;
  icon: React.ReactNode;
  proOnly: boolean;
  estimatedTime: string;
  sections: string[];
}

// Report templates
const reportTemplates: ReportTemplate[] = [
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level strategic analysis for decision makers',
    icon: <Briefcase className="h-5 w-5" />,
    proOnly: false,
    estimatedTime: 'Instant',
    sections: ['Key Findings', 'Market Opportunities', 'Strategic Recommendations', 'Risk Assessment']
  },
  {
    id: 'technical',
    name: 'Technical Deep Dive',
    description: 'Implementation roadmap and technical requirements',
    icon: <Code className="h-5 w-5" />,
    proOnly: false,
    estimatedTime: 'Instant',
    sections: ['Tech Stack', 'Performance Analysis', 'Feature Gaps', 'Implementation Timeline']
  },
  {
    id: 'investor',
    name: 'Investment Analysis',
    description: 'Market sizing, TAM, and revenue projections',
    icon: <DollarSign className="h-5 w-5" />,
    proOnly: true,
    estimatedTime: '30 seconds',
    sections: ['Market Size', 'Revenue Model', 'Competition Analysis', 'Exit Strategy']
  },
  {
    id: 'founder',
    name: 'Founder Playbook',
    description: 'Step-by-step guide to building a competitor',
    icon: <Rocket className="h-5 w-5" />,
    proOnly: true,
    estimatedTime: '30 seconds',
    sections: ['MVP Features', 'Go-to-Market', 'Pricing Strategy', 'Growth Tactics']
  },
  {
    id: 'marketer',
    name: 'Marketing Strategy',
    description: 'Positioning, messaging, and channel strategy',
    icon: <Megaphone className="h-5 w-5" />,
    proOnly: true,
    estimatedTime: '30 seconds',
    sections: ['Positioning', 'Target Audience', 'Content Strategy', 'Channel Mix']
  }
];

export function AIReportGenerator({ 
  tool,
  isPro = false,
  onUpgrade
}: { 
  tool: CompetitorData;
  isPro?: boolean;
  onUpgrade?: () => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportType>('executive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [reportFormat, setReportFormat] = useState<'markdown' | 'html' | 'pdf'>('markdown');
  const [copied, setCopied] = useState(false);
  const [aiUsageCount, setAiUsageCount] = useState(3); // Free tier: 5 uses per day

  // Generate report based on template (local processing for free, AI for pro)
  const generateReport = async () => {
    const template = reportTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Check if pro-only template
    if (template.proOnly && !isPro) {
      onUpgrade?.();
      return;
    }

    // Check AI usage for free tier
    if (!isPro && aiUsageCount <= 0) {
      alert('Daily AI limit reached. Upgrade to Pro for unlimited reports!');
      onUpgrade?.();
      return;
    }

    setIsGenerating(true);
    
    try {
      let report = '';
      
      if (template.proOnly) {
        // Pro version - Use AI API
        report = await generateAIReport(tool, selectedTemplate);
        if (!isPro) {
          setAiUsageCount(prev => prev - 1);
        }
      } else {
        // Free version - Use local templates
        report = generateLocalReport(tool, selectedTemplate);
      }
      
      setGeneratedReport(report);
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Local report generation (free tier - instant)
  const generateLocalReport = (tool: CompetitorData, type: ReportType): string => {
    const date = new Date().toLocaleDateString();
    
    // Calculate scores
    const opportunityScore = calculateOpportunityScore(tool);
    const problemScore = calculateProblemScore(tool);
    
    switch (type) {
      case 'executive':
        return `# Executive Summary: ${tool.name}

**Generated:** ${date}  
**Category:** ${tool.category}  
**Pricing:** ${tool.pricing}  
**Market Position:** ${tool.marketShare || 'Data not available'}

## 🎯 Key Findings

### Opportunity Score: ${opportunityScore}/10
${tool.name} presents ${opportunityScore > 7 ? 'exceptional' : opportunityScore > 5 ? 'strong' : 'moderate'} opportunities for disruption.

### Top 3 Market Gaps
${tool.industryGaps.slice(0, 3).map((gap, i) => 
`${i + 1}. **${gap.gap}**
   - Potential: ${gap.potential}
   - Difficulty: ${gap.difficulty}
   - Success Rate: ${gap.successProbability}%`
).join('\n')}

### Critical User Pain Points
- **Average Complaint Frequency:** ${problemScore}% of users
- **Most Critical Issue:** ${tool.userComplaints[0]?.issue || 'None identified'}
- **Severity:** ${tool.userComplaints[0]?.severity || 'Low'}

## 💡 Strategic Recommendations

1. **Quick Win**
   Focus on: ${tool.industryGaps.find(g => g.difficulty === 'easy')?.gap || 'performance improvements'}
   
2. **Differentiation**
   Position as the solution to "${tool.userComplaints[0]?.issue || 'current limitations'}"
   
3. **Market Entry**
   ${opportunityScore > 7 ? 'Immediate action recommended' : 'Strategic planning advised'}

## 🏆 Competitive Advantage
Build a ${tool.category.toLowerCase()} that addresses the ${problemScore}% of users frustrated with current solutions.

---
*This report is for strategic planning purposes only.*`;

      case 'technical':
        return `# Technical Analysis: ${tool.name}

**Date:** ${date}  
**Tool:** ${tool.name}  
**Category:** ${tool.category}

## 🔧 Technical Opportunities

### Performance Issues
${tool.userComplaints
  .filter(c => c.issue.toLowerCase().includes('slow') || c.issue.toLowerCase().includes('performance'))
  .map(c => `- ${c.issue} (${c.frequency}% affected)`)
  .join('\n') || '- No performance issues reported'}

### Feature Gaps
${tool.industryGaps.map(gap => 
`**${gap.gap}**
- Difficulty: ${gap.difficulty}
- Timeline: ${gap.difficulty === 'easy' ? '1-2 months' : gap.difficulty === 'medium' ? '3-6 months' : '6-12 months'}
- Success Rate: ${gap.successProbability}%`
).join('\n\n')}

### Recommended Tech Stack
- **Frontend:** ${tool.userComplaints.some(c => c.issue.includes('slow')) ? 'Next.js with SSG' : 'React/Next.js'}
- **Backend:** ${tool.industryGaps.some(g => g.gap.includes('offline')) ? 'Edge functions + Service Workers' : 'Node.js/Python'}
- **Database:** PostgreSQL + Redis for caching
- **Infrastructure:** ${tool.userComplaints.some(c => c.frequency > 30) ? 'Multi-region CDN' : 'Vercel/Netlify'}

## 🚀 Implementation Priority
1. Address performance bottlenecks
2. Implement offline capability
3. Add real-time features
4. Build API integrations

---
*Technical recommendations based on market analysis.*`;

      default:
        return 'Report template not found';
    }
  };

  // AI report generation (pro tier - uses API)
  const generateAIReport = async (tool: CompetitorData, type: ReportType): Promise<string> => {
    // Simulate AI processing (in real implementation, this would call your AI API)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return enhanced AI-generated report
    return `# AI-Generated ${type.charAt(0).toUpperCase() + type.slice(1)} Report

**Powered by Gap Finder AI** 🤖  
**Generated:** ${new Date().toISOString()}

## Executive Summary
Based on advanced AI analysis of ${tool.name} and market dynamics...

## Deep Market Insights
Our AI has identified ${Math.floor(Math.random() * 5) + 3} unique opportunities...

## Predictive Analytics
- **Success Probability:** ${Math.floor(Math.random() * 30) + 70}%
- **Time to Market:** ${Math.floor(Math.random() * 6) + 3} months
- **Expected ROI:** ${Math.floor(Math.random() * 200) + 100}%

## Custom Recommendations
[AI-generated strategic recommendations based on your specific context...]

---
*This is a Pro feature demonstration. Actual AI reports provide detailed, personalized insights.*`;
  };

  // Helper functions
  const calculateOpportunityScore = (tool: CompetitorData): number => {
    const score = tool.industryGaps.reduce((sum, gap) => {
      const potentialScore = gap.potential === 'very high' ? 4 : 
                            gap.potential === 'high' ? 3 : 
                            gap.potential === 'medium' ? 2 : 1;
      return sum + potentialScore * (gap.successProbability || 50) / 100;
    }, 0);
    return Math.min(10, Math.round(score * 2));
  };

  const calculateProblemScore = (tool: CompetitorData): number => {
    if (tool.userComplaints.length === 0) return 0;
    return Math.round(
      tool.userComplaints.reduce((sum, c) => sum + c.frequency, 0) / tool.userComplaints.length
    );
  };

  // Export functions
  const copyReport = async () => {
    if (!generatedReport) return;
    await navigator.clipboard.writeText(generatedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    if (!generatedReport) return;
    
    const blob = new Blob([generatedReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.name}-${selectedTemplate}-report.md`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              AI Report Generator
            </h2>
            <p className="text-gray-600 mt-1">
              Generate professional analysis reports in seconds
            </p>
          </div>
          
          {!isPro && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Free AI uses today:</p>
              <p className="text-2xl font-bold text-blue-600">{aiUsageCount}/5</p>
            </div>
          )}
        </div>

        {/* Template Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              disabled={template.proOnly && !isPro}
              className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${template.proOnly && !isPro ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {template.proOnly && !isPro && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                    PRO
                  </span>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedTemplate === template.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {template.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{template.estimatedTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1">Includes:</p>
                <div className="flex flex-wrap gap-1">
                  {template.sections.slice(0, 3).map(section => (
                    <span key={section} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                      {section}
                    </span>
                  ))}
                  {template.sections.length > 3 && (
                    <span className="text-xs text-gray-400">+{template.sections.length - 3}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="markdown">Markdown</option>
              <option value="html">HTML</option>
              <option value="pdf">PDF</option>
            </select>
            
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
          
          {!isPro && (
            <button
              onClick={onUpgrade}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Upgrade for Unlimited AI Reports
            </button>
          )}
        </div>
      </div>

      {/* Generated Report */}
      {generatedReport && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Generated Report</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={copyReport}
                className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
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
                onClick={downloadReport}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
          
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: generatedReport
                  .replace(/\n/g, '<br/>')
                  .replace(/#{1,3} /g, '<h3 class="font-bold text-lg mt-4 mb-2">')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Pro Features Preview */}
      {!isPro && (
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Unlock Pro Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Unlimited AI Reports</p>
                <p className="text-sm text-gray-600">Generate as many reports as you need</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Advanced Analytics</p>
                <p className="text-sm text-gray-600">Deep market insights and predictions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Team Collaboration</p>
                <p className="text-sm text-gray-600">Share reports with your team</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">API Access</p>
                <p className="text-sm text-gray-600">Integrate with your workflow</p>
              </div>
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
          >
            Start Free Trial - No Credit Card Required
          </button>
        </div>
      )}
    </div>
  );
}

// Missing imports added
import { Briefcase, Code, Rocket, Megaphone } from 'lucide-react';