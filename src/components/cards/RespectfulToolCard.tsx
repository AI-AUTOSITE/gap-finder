// src/components/cards/RespectfulToolCard.tsx

import { RespectfulCompetitorAnalysis } from '@/types';
import { Disclaimer } from '@/components/Disclaimer';

export function RespectfulToolCard({ 
  tool 
}: { 
  tool: RespectfulCompetitorAnalysis 
}) {
  return (
    <div className="card hover:shadow-xl transition-all duration-200">
      {/* 必ず強みから始める */}
      <div className="card-body">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{tool.name}</h3>
            <p className="text-sm text-gray-600">{tool.category}</p>
            <p className="text-sm text-brand-600 font-medium mt-1">{tool.pricing}</p>
          </div>
          {tool.marketShare && (
            <span className="strength-badge">
              {tool.marketShare} market leader
            </span>
          )}
        </div>

        {/* 強みセクション（最初に表示） */}
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-700 mb-2">
            ✨ Key Strengths
          </h4>
          <ul className="space-y-1">
            {tool.strengths.slice(0, 3).map((strength, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    {strength.feature}
                  </span>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {strength.userBenefit}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 改善機会（建設的に） */}
        <div className="mb-4">
          <h4 className="font-semibold text-blue-700 mb-2">
            💡 Innovation Opportunities
          </h4>
          <div className="space-y-2">
            {tool.improvementOpportunities.slice(0, 2).map((opp, i) => (
              <div key={i} className="opportunity-badge">
                <p className="text-sm">{opp.potentialEnhancement}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 市場機会 */}
        {tool.marketOpportunities.length > 0 && (
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-sm font-semibold text-purple-700">
              🚀 Market Opportunity: {tool.marketOpportunities[0].opportunity}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              {tool.marketOpportunities[0].marketNeed}
            </p>
          </div>
        )}

        {/* コンパクトな免責事項 */}
        <div className="mt-4 pt-3 border-t">
          <Disclaimer compact={true} />
        </div>
      </div>
    </div>
  );
}