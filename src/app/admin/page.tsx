'use client';

import React, { useState } from 'react';
import { Plus, FileJson, Check, Copy, Save, AlertCircle, ChevronRight } from 'lucide-react';

export default function AdminPage() {
  const [mode, setMode] = useState<'detail' | 'compare'>('detail');
  const [toolName, setToolName] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [savedFiles, setSavedFiles] = useState<Record<string, any>>({});
  const [currentFile, setCurrentFile] = useState('basic_info');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  // 詳細ページ用のファイルリスト
  const detailFiles = [
    'basic_info',
    'strengths',
    'pricing',
    'opportunities',
    'market_position',
    'success_stories',
    'technical_specs'
  ];

  // 比較ページ用のファイルリスト
  const compareFiles = [
    'comparison_overview',
    'side_by_side',
    'use_case_recommendations',
    'unique_strengths',
    'migration_paths',
    'innovation_opportunities'
  ];

  const files = mode === 'detail' ? detailFiles : compareFiles;

  // JSONを保存
  const saveJson = () => {
    try {
      // JSON構文チェック
      const parsed = JSON.parse(jsonInput);
      
      // 保存
      setSavedFiles(prev => ({
        ...prev,
        [currentFile]: parsed
      }));
      
      setStatus(`✅ ${currentFile}.json saved successfully!`);
      setStatusType('success');
      
      // 次のファイルに自動移動
      const currentIndex = files.indexOf(currentFile);
      if (currentIndex < files.length - 1) {
        setCurrentFile(files[currentIndex + 1]);
        setJsonInput('');
        
        // 次のファイルの案内
        setTimeout(() => {
          setStatus(`Now paste ${files[currentIndex + 1]}.json`);
          setStatusType('info');
        }, 2000);
      }
    } catch (e) {
      setStatus('❌ Invalid JSON format. Please check your input.');
      setStatusType('error');
    }
  };

  // 全ファイルを結合して出力
  const generateFinalJson = () => {
    const toolId = toolName.toLowerCase().replace(/\s+/g, '-');
    
    if (mode === 'detail') {
      // 詳細ページ用の構造
      const detailData = {
        id: toolId,
        name: toolName,
        category: savedFiles.basic_info?.category || 'Unknown',
        website: savedFiles.basic_info?.website || '',
        pricing: savedFiles.pricing?.plans?.[0]?.price + ' - ' + savedFiles.pricing?.plans?.[savedFiles.pricing?.plans?.length - 1]?.price || 'Unknown',
        marketShare: savedFiles.market_position?.marketShare || '',
        keywords: [], // Claudeに後で生成してもらう
        aliases: [], // Claudeに後で生成してもらう
        industryPosition: savedFiles.market_position?.position || 'emerging',
        
        // ユーザーの不満を変換
        userComplaints: savedFiles.opportunities?.userRequests?.map((req: any) => ({
          issue: req.request,
          frequency: parseInt(req.frequency) || 30,
          severity: req.opportunitySize === 'large' ? 'high' : req.opportunitySize === 'medium' ? 'medium' : 'low',
          source: 'User Research',
          trends: 'stable',
          examples: [req.currentWorkaround]
        })) || [],
        
        // 市場ギャップを変換
        industryGaps: savedFiles.opportunities?.marketOpportunities?.map((opp: any) => ({
          gap: opp.opportunity,
          affectedTools: [toolName],
          opportunity: opp.potentialInnovation,
          claudeInsight: opp.marketDemand,
          marketImpact: opp.estimatedMarketSize,
          difficulty: opp.implementationDifficulty,
          potential: 'high',
          timeframe: '6-12 months',
          successProbability: 70
        })) || [],
        
        // 類似ツール（後で追加）
        similarTools: [],
        
        // その他のデータ
        actionStrategies: [],
        successStories: savedFiles.success_stories?.inspiringExamples || [],
        
        lastUpdated: new Date().toISOString().split('T')[0],
        dataQuality: 'high',
        communityVotes: 0,
        userRequested: true
      };
      
      return JSON.stringify(detailData, null, 2);
    } else {
      // 比較ページ用の構造
      return JSON.stringify(savedFiles, null, 2);
    }
  };

  // クリップボードにコピー
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateFinalJson());
    setStatus('📋 Copied to clipboard! Now paste it into competitors.json');
    setStatusType('success');
  };

  // ファイルとしてダウンロード
  const downloadJson = () => {
    const blob = new Blob([generateFinalJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolName.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    setStatus('📥 Downloaded! Add this to your competitors.json');
    setStatusType('success');
  };

  // Claudeプロンプトを生成
  const generatePrompt = () => {
    const promptTemplate = mode === 'detail' 
      ? `Please analyze this tool for Gap Finder using the Detail Page Version template:

Tool Name: ${toolName}
Category: [Please determine based on the tool]
Official Website: [Please find the official website]

IMPORTANT: Generate all 7 JSON files separately with clear labels:
1. basic_info.json
2. strengths.json
3. pricing.json
4. opportunities.json
5. market_position.json
6. success_stories.json
7. technical_specs.json

Use the exact format from the template. Be respectful and constructive in your analysis.`
      : `Please compare these tools for Gap Finder using the Compare Page Version template:

Tool 1: ${toolName.split(' vs ')[0]}
Tool 2: ${toolName.split(' vs ')[1]}
Category: [Please determine based on the tools]

IMPORTANT: Generate all 6 JSON files separately with clear labels:
1. comparison_overview.json
2. side_by_side.json
3. use_case_recommendations.json
4. unique_strengths.json
5. migration_paths.json
6. innovation_opportunities.json

Use the exact format from the template. Be neutral and helpful in your comparison.`;
    
    navigator.clipboard.writeText(promptTemplate);
    setStatus('📋 Prompt copied! Now paste it to Claude and wait for the JSONs');
    setStatusType('success');
  };

  const completedCount = Object.keys(savedFiles).length;
  const progress = (completedCount / files.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            Gap Finder - Tool追加管理画面
          </h1>

          {/* モード選択 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Step 1: モード選択</h2>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  setMode('detail');
                  setSavedFiles({});
                  setCurrentFile('basic_info');
                  setToolName('');
                  setJsonInput('');
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  mode === 'detail' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔍 詳細ページ作成
              </button>
              <button
                onClick={() => {
                  setMode('compare');
                  setSavedFiles({});
                  setCurrentFile('comparison_overview');
                  setToolName('');
                  setJsonInput('');
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  mode === 'compare' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⚖️ 比較ページ作成
              </button>
            </div>

            {/* ツール名入力 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'detail' ? 'ツール名:' : '比較 (Tool1 vs Tool2):'}
              </label>
              <input
                type="text"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder={mode === 'detail' ? '例: Figma' : '例: Figma vs Canva'}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Claudeプロンプト生成ボタン */}
            {toolName && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Step 2: Claudeで分析</h3>
                <button
                  onClick={generatePrompt}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Copy className="w-5 h-5" />
                  Claudeプロンプトをコピー
                </button>
              </div>
            )}
          </div>

          {/* プログレスバー */}
          {toolName && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span className="font-medium">進捗状況</span>
                <span className="font-bold text-blue-600">{completedCount}/{files.length} files</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* ファイル選択タブ */}
          {toolName && (
            <>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Step 3: JSONを順番に貼り付け</h3>
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {files.map((file) => (
                    <button
                      key={file}
                      onClick={() => setCurrentFile(file)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentFile === file
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          : savedFiles[file]
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {savedFiles[file] && <Check className="w-4 h-4 inline mr-1" />}
                      {file}.json
                    </button>
                  ))}
                </div>
              </div>

              {/* JSON入力エリア */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentFile}.json を貼り付け:
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`=== FILE: ${currentFile}.json ===\n{\n  ...\n}`}
                  className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 保存ボタン */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={saveJson}
                  disabled={!jsonInput}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 transition-all flex items-center gap-2 font-medium shadow-lg disabled:shadow-none"
                >
                  <Save className="w-5 h-5" />
                  {currentFile}.json を保存
                </button>
              </div>
            </>
          )}

          {/* ステータス表示 */}
          {status && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
              statusType === 'success' ? 'bg-green-50 text-green-800 border-2 border-green-200' :
              statusType === 'error' ? 'bg-red-50 text-red-800 border-2 border-red-200' :
              'bg-blue-50 text-blue-800 border-2 border-blue-200'
            }`}>
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{status}</span>
            </div>
          )}

          {/* 完了時のアクション */}
          {completedCount === files.length && files.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <h3 className="font-bold text-green-800 mb-4 text-lg">
                🎉 すべてのファイルが揃いました！
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 font-medium shadow-lg"
                >
                  <Copy className="w-5 h-5" />
                  最終JSONをコピー
                </button>
                <button
                  onClick={downloadJson}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 font-medium shadow-lg"
                >
                  <FileJson className="w-5 h-5" />
                  ファイルでダウンロード
                </button>
              </div>
            </div>
          )}

          {/* 使い方ガイド */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">📖 使い方ガイド</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">1</span>
                <p className="text-gray-600">モードを選択（詳細 or 比較）</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">2</span>
                <p className="text-gray-600">ツール名を入力</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold">3</span>
                <p className="text-gray-600">"Claudeプロンプトをコピー"をクリック</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold">4</span>
                <p className="text-gray-600">Claudeに貼り付けて実行</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">5</span>
                <p className="text-gray-600">生成された各JSONを順番に貼り付けて保存</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center font-bold">6</span>
                <p className="text-gray-600">全部完了したら最終JSONをコピー</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center font-bold">7</span>
                <p className="text-gray-600">competitors.jsonに追加してGitHubにpush</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}