// src/components/search/CategoryFilter.tsx
'use client';

import { useState } from 'react';
import { 
  Palette, 
  Code, 
  Briefcase, 
  MessageSquare, 
  TrendingUp, 
  BarChart, 
  FolderOpen, 
  ShoppingCart, 
  Brain, 
  DollarSign,
  Users,
  Headphones,
  Package,
  GraduationCap,
  Heart,
  Grid3X3,  // ← 修正：Grid3x3 → Grid3X3（大文字のX）
  ChevronRight
} from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  toolCounts?: Record<string, number>;
}

// カテゴリごとのアイコンマッピング
const categoryIcons: Record<string, React.ReactNode> = {
  'Design Tool': <Palette className="h-4 w-4" />,
  'Development Tool': <Code className="h-4 w-4" />,
  'Productivity Tool': <Briefcase className="h-4 w-4" />,
  'Communication Tool': <MessageSquare className="h-4 w-4" />,
  'Marketing': <TrendingUp className="h-4 w-4" />,
  'Analytics': <BarChart className="h-4 w-4" />,
  'Project Management': <FolderOpen className="h-4 w-4" />,
  'E-commerce': <ShoppingCart className="h-4 w-4" />,
  'AI Tool': <Brain className="h-4 w-4" />,
  'AI Image Generation': <Brain className="h-4 w-4" />,
  'Finance': <DollarSign className="h-4 w-4" />,
  'Payment Platform': <DollarSign className="h-4 w-4" />,
  'HR': <Users className="h-4 w-4" />,
  'Customer Support': <Headphones className="h-4 w-4" />,
  'Sales': <Package className="h-4 w-4" />,
  'Education': <GraduationCap className="h-4 w-4" />,
  'Health': <Heart className="h-4 w-4" />,
  'Hosting Platform': <Package className="h-4 w-4" />,
  'Video Conferencing': <MessageSquare className="h-4 w-4" />,
  'Database Tool': <Grid3X3 className="h-4 w-4" />,  // ← 修正
  'Other': <Grid3X3 className="h-4 w-4" />  // ← 修正
};

// カテゴリの説明
const categoryDescriptions: Record<string, string> = {
  'Design Tool': 'Canva, Figma, Sketch and more',
  'Development Tool': 'GitHub, GitLab, VS Code and more',
  'Productivity Tool': 'Notion, Obsidian, Todoist and more',
  'Communication Tool': 'Slack, Discord, Teams and more',
  'AI Tool': 'ChatGPT, Claude, Copilot and more',
  'Project Management': 'Linear, Jira, Asana and more',
  'Payment Platform': 'Stripe, PayPal, Square and more',
  'Hosting Platform': 'Vercel, Netlify, Heroku and more',
  'Video Conferencing': 'Zoom, Meet, Teams and more',
  'Database Tool': 'Airtable, Supabase, Firebase and more',
  'AI Image Generation': 'Midjourney, DALL-E, Stable Diffusion and more'
};

// カテゴリの色
const categoryColors: Record<string, string> = {
  'Design Tool': 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
  'Development Tool': 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
  'Productivity Tool': 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
  'Communication Tool': 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200',
  'AI Tool': 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
  'AI Image Generation': 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200',
  'Project Management': 'bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200',
  'Payment Platform': 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
  'Hosting Platform': 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200',
  'Video Conferencing': 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200',
  'Database Tool': 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
  'default': 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
};

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  toolCounts = {}
}: CategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // 表示するカテゴリ数（デフォルトは8個）
  const displayLimit = isExpanded ? categories.length : 8;
  const displayCategories = categories.slice(0, displayLimit);
  const hasMore = categories.length > 8;

  // カテゴリ選択ハンドラー
  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      onCategorySelect(null); // 選択解除
    } else {
      onCategorySelect(category);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-brand-500" />  {/* ← 修正 */}
          Browse by Category
        </h3>
        
        {selectedCategory && (
          <button
            onClick={() => onCategorySelect(null)}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {/* All Categories Button */}
        <button
          onClick={() => onCategorySelect(null)}
          className={`
            group relative p-4 rounded-xl border-2 transition-all duration-200
            ${!selectedCategory 
              ? 'bg-brand-50 border-brand-500 shadow-md' 
              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
            }
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Grid3X3 className={`h-4 w-4 ${!selectedCategory ? 'text-brand-600' : 'text-gray-600'}`} />  {/* ← 修正 */}
                <span className={`font-medium ${!selectedCategory ? 'text-brand-700' : 'text-gray-900'}`}>
                  All Tools
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Browse everything
              </p>
            </div>
            <span className={`
              text-xs font-semibold px-2 py-1 rounded-full
              ${!selectedCategory ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'}
            `}>
              {Object.values(toolCounts).reduce((a, b) => a + b, 0) || categories.length}
            </span>
          </div>
        </button>

        {/* Category Cards */}
        {displayCategories.map((category) => {
          const icon = categoryIcons[category] || categoryIcons['Other'];
          const description = categoryDescriptions[category];
          const colorClass = categoryColors[category] || categoryColors['default'];
          const count = toolCounts[category] || 0;
          const isSelected = selectedCategory === category;
          
          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              onMouseEnter={() => setHoveredCategory(category)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`
                group relative p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? `${colorClass} border-current shadow-md` 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={isSelected ? '' : 'text-gray-600 group-hover:text-gray-900'}>
                      {icon}
                    </span>
                    <span className={`font-medium ${isSelected ? '' : 'text-gray-900'}`}>
                      {category}
                    </span>
                  </div>
                  {description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>
                <span className={`
                  text-xs font-semibold px-2 py-1 rounded-full
                  ${isSelected 
                    ? 'bg-white/50' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }
                `}>
                  {count}
                </span>
              </div>

              {/* Hover effect arrow */}
              {hoveredCategory === category && !isSelected && (
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium 
                     inline-flex items-center gap-1"
          >
            {isExpanded ? (
              <>Show Less Categories</>
            ) : (
              <>Show {categories.length - 8} More Categories</>
            )}
          </button>
        </div>
      )}

      {/* Active Filter Indicator */}
      {selectedCategory && (
        <div className="mt-4 p-3 bg-brand-50 rounded-lg border border-brand-200">
          <p className="text-sm text-brand-700">
            <span className="font-medium">Active filter:</span> Showing only {selectedCategory} tools
            {toolCounts[selectedCategory] && (
              <span className="ml-1">({toolCounts[selectedCategory]} results)</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}