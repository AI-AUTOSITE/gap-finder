// src/components/badges/ToolBadges.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Swords, RefreshCw, Gem, Star, X, ArrowRight } from 'lucide-react';

// ============================================
// メインのバッジコンポーネント
// ============================================
interface ToolBadgesProps {
  tool: {
    id: string;
    name: string;
    category: string;
    similarTools?: Array<{ id: string; name: string; }>;
  };
  onCategoryClick: (category: string) => void;
  onToolClick: (toolName: string) => void;
}

export function ToolBadges({ tool, onCategoryClick, onToolClick }: ToolBadgesProps) {
  // 競合・類似・代替ツールを定義
  // TODO: 後でcompetitors.jsonに追加
  const competitors = tool.similarTools?.slice(0, 2).map(t => t.name) || [];
  const similar = tool.similarTools?.slice(0, 3).map(t => t.name) || [];
  const alternatives = tool.similarTools?.slice(-2).map(t => t.name) || [];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* カテゴリバッジ（紫グラデーション） */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCategoryClick(tool.category);
        }}
        className="inline-flex items-center px-3 py-1 
                   bg-gradient-to-r from-purple-600 to-pink-600 
                   text-white text-xs font-semibold rounded-full 
                   hover:shadow-md transition-all transform hover:scale-105"
        title={`View all ${tool.category} tools`}
      >
        🏷 {tool.category}
      </button>

      {/* 競合バッジ（オレンジ） */}
      {competitors.length > 0 && competitors.map(competitor => (
        <button
          key={`comp-${competitor}`}
          onClick={(e) => {
            e.stopPropagation();
            onToolClick(competitor);
          }}
          className="inline-flex items-center gap-1 px-3 py-1 
                     bg-gradient-to-r from-orange-500 to-amber-500 
                     text-white text-xs font-semibold rounded-full 
                     hover:shadow-md transition-all transform hover:scale-105"
          title={`Direct competitor: ${competitor}`}
        >
          <Swords className="h-3 w-3" />
          {competitor}
        </button>
      ))}

      {/* 類似バッジ（緑） - 最大2つ */}
      {similar.length > 0 && similar.slice(0, 2).map(sim => (
        <button
          key={`sim-${sim}`}
          onClick={(e) => {
            e.stopPropagation();
            onToolClick(sim);
          }}
          className="inline-flex items-center gap-1 px-3 py-1 
                     bg-gradient-to-r from-green-500 to-emerald-500 
                     text-white text-xs font-semibold rounded-full 
                     hover:shadow-md transition-all transform hover:scale-105"
          title={`Similar tool: ${sim}`}
        >
          <RefreshCw className="h-3 w-3" />
          {sim}
        </button>
      ))}

      {/* 代替バッジ（ピンク） - 1つだけ表示 */}
      {alternatives.length > 0 && alternatives.slice(0, 1).map(alt => (
        <button
          key={`alt-${alt}`}
          onClick={(e) => {
            e.stopPropagation();
            onToolClick(alt);
          }}
          className="inline-flex items-center gap-1 px-3 py-1 
                     bg-gradient-to-r from-pink-500 to-rose-500 
                     text-white text-xs font-semibold rounded-full 
                     hover:shadow-md transition-all transform hover:scale-105"
          title={`Free alternative: ${alt}`}
        >
          <Gem className="h-3 w-3" />
          {alt}
        </button>
      ))}
    </div>
  );
}

// ============================================
// モーダルコンポーネント
// ============================================
interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tools: Array<{
    id: string;
    name: string;
    category: string;
    pricing: string;
    marketShare?: string;
  }>;
  onSelectTool: (toolName: string) => void;
}

export function ToolsModal({ 
  isOpen, 
  onClose, 
  title, 
  tools, 
  onSelectTool 
}: ToolsModalProps) {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // スクロールを防ぐ
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 
                        flex justify-between items-center">
          <h3 className="text-2xl font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* ツール一覧 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {tools.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No tools found in this category</p>
          ) : (
            <div className="space-y-3">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.name);
                    onClose();
                  }}
                  className="w-full p-4 bg-gray-50 hover:bg-purple-50 
                           rounded-lg transition text-left group 
                           border-2 border-transparent hover:border-purple-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-purple-600">
                        {tool.name}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">{tool.pricing}</span>
                        {tool.marketShare && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {tool.marketShare}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{tool.category}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// お気に入りボタンコンポーネント
// ============================================
interface FavoriteButtonProps {
  toolId: string;
  isFavorite: boolean;
  onToggle: () => void;
}

export function FavoriteButton({ toolId, isFavorite, onToggle }: FavoriteButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
        isFavorite 
          ? 'bg-yellow-100 text-yellow-600' 
          : 'bg-gray-100 text-gray-400 hover:text-yellow-600'
      }`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
    </button>
  );
}

// ============================================
// お気に入りセクションコンポーネント
// ============================================
interface FavoritesSectionProps {
  favorites: string[];
  tools: Array<{ id: string; name: string; }>;
  onToolClick: (toolName: string) => void;
  onClearAll?: () => void;
}

export function FavoritesSection({ 
  favorites, 
  tools, 
  onToolClick,
  onClearAll 
}: FavoritesSectionProps) {
  if (favorites.length === 0) return null;

  return (
    <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
          Your Favorites ({favorites.length})
        </h3>
        {onClearAll && (
          <button
            onClick={onClearAll}
            className="text-sm text-gray-500 hover:text-red-600 transition"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {favorites.map(id => {
          const tool = tools.find(t => t.id === id);
          return tool ? (
            <button
              key={id}
              onClick={() => onToolClick(tool.name)}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full 
                       hover:bg-yellow-200 transition font-medium text-sm"
            >
              {tool.name}
            </button>
          ) : null;
        })}
      </div>
    </div>
  );
}

// CSSアニメーション用のスタイル（Tailwindの設定に追加が必要）
// tailwind.config.jsに以下を追加：
/*
module.exports = {
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
}
*/