'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Heart, 
  BarChart3, 
  Download,
  Zap,
  Command,
  ArrowUp,
  X,
  Sparkles,
  Target,
  AlertCircle
} from 'lucide-react';

interface QuickActionsProps {
  onSearch?: () => void;
  onCompare?: () => void;
  onFavorite?: () => void;
  onExport?: () => void;
  onInsights?: () => void;
}

export function QuickActions({
  onSearch,
  onCompare,
  onFavorite,
  onExport,
  onInsights
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [recentAction, setRecentAction] = useState<string | null>(null);

  // スクロール監視
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K でクイックアクション開く
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      
      // その他のショートカット
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch(e.key) {
          case '/':
            if (document.activeElement?.tagName !== 'INPUT') {
              e.preventDefault();
              onSearch?.();
            }
            break;
          case 'c':
            if (document.activeElement?.tagName !== 'INPUT') {
              e.preventDefault();
              onCompare?.();
            }
            break;
          case 'f':
            if (document.activeElement?.tagName !== 'INPUT') {
              e.preventDefault();
              onFavorite?.();
            }
            break;
          case '?':
            if (document.activeElement?.tagName !== 'INPUT') {
              e.preventDefault();
              setIsOpen(true);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onSearch, onCompare, onFavorite]);

  const handleAction = (action: string, callback?: () => void) => {
    setRecentAction(action);
    callback?.();
    setIsOpen(false);
    
    // 最近のアクションを3秒後にクリア
    setTimeout(() => setRecentAction(null), 3000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* メインのフローティングボタン */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          {/* 最近のアクション表示 */}
          {recentAction && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap">
              {recentAction}
            </div>
          )}
          
          {/* アクションメニュー */}
          {isOpen && (
            <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl p-2 min-w-[200px] animate-slide-up">
              <div className="p-2 border-b">
                <p className="text-xs font-medium text-gray-500">Quick Actions</p>
              </div>
              
              <button
                onClick={() => handleAction('Smart Search', onSearch)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3 group"
              >
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Smart Search</span>
                <kbd className="ml-auto text-xs bg-gray-100 px-1.5 py-0.5 rounded">/</kbd>
              </button>
              
              <button
                onClick={() => handleAction('Compare Tools', onCompare)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3 group"
              >
                <BarChart3 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Compare</span>
                <kbd className="ml-auto text-xs bg-gray-100 px-1.5 py-0.5 rounded">C</kbd>
              </button>
              
              <button
                onClick={() => handleAction('Favorites', onFavorite)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3 group"
              >
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm">Favorites</span>
                <kbd className="ml-auto text-xs bg-gray-100 px-1.5 py-0.5 rounded">F</kbd>
              </button>
              
              <button
                onClick={() => handleAction('Export Data', onExport)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3 group"
              >
                <Download className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Export</span>
              </button>
              
              <button
                onClick={() => handleAction('View Insights', onInsights)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3 group"
              >
                <Target className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Insights</span>
              </button>
              
              <div className="border-t mt-2 pt-2">
                <p className="text-xs text-gray-400 px-3 py-1">
                  Press <kbd className="bg-gray-100 px-1 rounded">?</kbd> for help
                </p>
              </div>
            </div>
          )}
          
          {/* メインボタン */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-4 rounded-full shadow-lg transition-all duration-200 ${
              isOpen 
                ? 'bg-gray-900 text-white rotate-45' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-110'
            }`}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
          </button>
          
          {/* ショートカットヒント */}
          <div className="absolute -top-1 -right-1">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </div>
        </div>
        
        {/* スクロールトップボタン */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="absolute bottom-0 right-16 p-3 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-50 transition-all"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* キーボードショートカットヘルプ */}
      {isOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}