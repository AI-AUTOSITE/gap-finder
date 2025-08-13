'use client';

import { useEffect, useState } from 'react';
import { Command, Search, Heart, BarChart3, Download, HelpCircle, X } from 'lucide-react';

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // メタキーの組み合わせ
      if (e.metaKey || e.ctrlKey) {
        switch(e.key) {
          case 'k':
            e.preventDefault();
            // クイックアクションを開く
            window.dispatchEvent(new CustomEvent('toggle-quick-actions'));
            break;
          case '/':
            e.preventDefault();
            // 検索にフォーカス
            focusSearch();
            break;
          case 's':
            e.preventDefault();
            // 保存/エクスポート
            window.dispatchEvent(new CustomEvent('toggle-export'));
            break;
        }
        return;
      }
      
      // 入力フィールドにフォーカスがある場合はスキップ
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || 
                            activeElement?.tagName === 'TEXTAREA' ||
                            activeElement?.getAttribute('contenteditable') === 'true';
      
      if (isInputFocused) return;
      
      // シングルキーショートカット
      switch(e.key) {
        case '/':
          e.preventDefault();
          focusSearch();
          break;
        case 'c':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('toggle-compare'));
          showNotification('Compare mode activated');
          break;
        case 'f':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('toggle-favorites'));
          showNotification('Favorites panel opened');
          break;
        case 'i':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('toggle-insights'));
          showNotification('Insights dashboard opened');
          break;
        case 'e':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('toggle-export'));
          showNotification('Export panel opened');
          break;
        case '?':
          e.preventDefault();
          setShowHelp(!showHelp);
          break;
        case 'Escape':
          // すべてのモーダルを閉じる
          closeAllModals();
          break;
        case 'g':
          // g + h でホームへ
          if (e.shiftKey) {
            e.preventDefault();
            window.location.href = '/';
          }
          break;
        case 'j':
          // 次のアイテムへ
          e.preventDefault();
          navigateItems('next');
          break;
        case 'k':
          // 前のアイテムへ
          e.preventDefault();
          navigateItems('prev');
          break;
        case 'Enter':
          // 選択中のアイテムを開く
          openSelectedItem();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          // 数字キーでタブ切り替え
          e.preventDefault();
          switchTab(parseInt(e.key));
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelp]);
  
  // ヘルパー関数
  const focusSearch = () => {
    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
      showNotification('Search focused');
    }
  };
  
  const showNotification = (message: string) => {
    window.dispatchEvent(new CustomEvent('app-notification', {
      detail: { type: 'info', message }
    }));
  };
  
  const closeAllModals = () => {
    setShowHelp(false);
    window.dispatchEvent(new CustomEvent('close-all-modals'));
  };
  
  const navigateItems = (direction: 'next' | 'prev') => {
    // カード要素を取得
    const cards = Array.from(document.querySelectorAll('[data-tool-card]'));
    const currentIndex = cards.findIndex(card => card.classList.contains('ring-2'));
    
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0) nextIndex = cards.length - 1;
    if (nextIndex >= cards.length) nextIndex = 0;
    
    // 前の選択を解除
    cards.forEach(card => card.classList.remove('ring-2', 'ring-blue-500'));
    
    // 新しい選択を追加
    if (cards[nextIndex]) {
      cards[nextIndex].classList.add('ring-2', 'ring-blue-500');
      cards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  const openSelectedItem = () => {
    const selected = document.querySelector('[data-tool-card].ring-2') as HTMLElement;
    if (selected) {
      selected.click();
    }
  };
  
  const switchTab = (tabNumber: number) => {
    const tabs = document.querySelectorAll('[role="tab"]');
    if (tabs[tabNumber - 1]) {
      (tabs[tabNumber - 1] as HTMLElement).click();
    }
  };
  
  // ヘルプモーダル
  if (showHelp) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Command className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Navigation */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Navigation
                </h3>
                <div className="space-y-2">
                  <ShortcutItem keys={['/']} description="Focus search" />
                  <ShortcutItem keys={['j']} description="Next item" />
                  <ShortcutItem keys={['k']} description="Previous item" />
                  <ShortcutItem keys={['Enter']} description="Open selected" />
                  <ShortcutItem keys={['g', 'h']} description="Go home" />
                </div>
              </div>
              
              {/* Actions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Command className="h-4 w-4" />
                  Actions
                </h3>
                <div className="space-y-2">
                  <ShortcutItem keys={['c']} description="Compare tools" />
                  <ShortcutItem keys={['f']} description="Toggle favorites" />
                  <ShortcutItem keys={['i']} description="View insights" />
                  <ShortcutItem keys={['e']} description="Export data" />
                  <ShortcutItem keys={['?']} description="Show this help" />
                </div>
              </div>
              
              {/* Global */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Command className="h-4 w-4" />
                  Global
                </h3>
                <div className="space-y-2">
                  <ShortcutItem keys={['⌘', 'k']} description="Quick actions" />
                  <ShortcutItem keys={['⌘', '/']} description="Search everywhere" />
                  <ShortcutItem keys={['⌘', 's']} description="Save/Export" />
                  <ShortcutItem keys={['Esc']} description="Close modals" />
                </div>
              </div>
              
              {/* Tabs */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Tab Navigation</h3>
                <div className="space-y-2">
                  <ShortcutItem keys={['1-5']} description="Switch tabs" />
                  <ShortcutItem keys={['Tab']} description="Next field" />
                  <ShortcutItem keys={['⇧', 'Tab']} description="Previous field" />
                </div>
              </div>
            </div>
            
            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Pro Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use vim-style navigation (j/k) to browse tools quickly</li>
                <li>• Press numbers 1-5 to instantly switch between tabs</li>
                <li>• Combine shortcuts for faster workflow (e.g., "/" then type)</li>
                <li>• All shortcuts work offline - perfect for airplane mode!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}

// ショートカットアイテムコンポーネント
function ShortcutItem({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded font-mono"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}