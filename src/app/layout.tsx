'use client';

import { useEffect, useState } from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { QuickActions } from '@/components/ui/QuickActions';
import { KeyboardShortcuts } from '@/components/ui/KeyboardShortcuts';
import Header from '@/components/layout/Header';
import NPSSurvey from '@/components/feedback/NPSSurvey';
import './globals.css';

// フォント最適化
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// 構造化データ（JSON-LD）
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Gap Finder',
  description: 'Smart competitor analysis tool for indie hackers and startups',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free tier available with premium features'
  },
  author: {
    '@type': 'Organization',
    name: 'Gap Finder',
    url: 'https://gap-finder.com'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '127'
  }
};

// オフライン状態インジケーター
function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 初期状態をチェック
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bg-orange-500 text-white text-center py-2 z-40 text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span>You're offline - Gap Finder works without internet!</span>
      </div>
    </div>
  );
}

// PWAインストールプロンプト
function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">Install Gap Finder</p>
          <p className="text-sm text-gray-600">Access offline, faster loading</p>
        </div>
        <button onClick={handleInstall} className="btn-primary btn-sm">
          Install
        </button>
        <button onClick={() => setShowPrompt(false)} className="btn-ghost btn-sm">
          ×
        </button>
      </div>
    </div>
  );
}

// 通知システム
function NotificationSystem() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    // カスタムイベントリスナー
    const handleNotification = (event: CustomEvent) => {
      const newNotification = {
        id: Date.now().toString(),
        type: event.detail.type || 'info',
        message: event.detail.message,
        timestamp: new Date()
      };
      
      setNotifications(prev => [...prev, newNotification]);
      
      // 5秒後に自動削除
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    };

    window.addEventListener('app-notification' as any, handleNotification);
    return () => window.removeEventListener('app-notification' as any, handleNotification);
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in
            ${notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'}
          `}
        >
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      ))}
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // オンライン状態の監視
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 免責事項の表示処理
  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('disclaimer-acknowledged');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }

    // Service Worker登録
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        registration => console.log('ServiceWorker registered:', registration.scope),
        error => console.log('ServiceWorker registration failed:', error)
      );
    }

    // パフォーマンス監視
    if ('performance' in window && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // LCP (Largest Contentful Paint) を監視
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }, []);

  const handleDisclaimerAccept = () => {
    localStorage.setItem('disclaimer-acknowledged', 'true');
    setShowDisclaimer(false);
  };

  // クイックアクションのハンドラー
  const handleSearch = () => {
    // 検索フォーカス
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    searchInput?.focus();
  };

  const handleCompare = () => {
    // 比較モードをトリガー
    window.dispatchEvent(new CustomEvent('app-notification', {
      detail: { type: 'info', message: 'Compare mode activated' }
    }));
  };

  const handleFavorite = () => {
    // お気に入りパネルを開く
    window.dispatchEvent(new CustomEvent('toggle-favorites'));
  };

  const handleExport = () => {
    // エクスポートパネルを開く
    window.dispatchEvent(new CustomEvent('toggle-export'));
  };

  const handleInsights = () => {
    // インサイトダッシュボードへ
    window.dispatchEvent(new CustomEvent('toggle-insights'));
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* 構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        
        {/* プリロード最適化 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="/data/competitors.json" as="fetch" crossOrigin="anonymous" />
        
        {/* PWA関連 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Gap Finder" />
        
        {/* SEO最適化 */}
        <title>Gap Finder - Smart Competitor Analysis for Indie Hackers</title>
        <meta name="description" content="Find market gaps and competitive advantages instantly. Analyze competitors + similar tools offline. Built for indie hackers who want to win." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* テーマカラー */}
        <meta name="theme-color" content="#3b82f6" />
        
        {/* マニフェスト */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* スキップリンク（アクセシビリティ） */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-500 text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>
        
        {/* 追従型ヘッダー */}
        <Header isOnline={isOnline} />
        
        {/* オフラインインジケーター */}
        <OfflineIndicator />
        
        {/* メインコンテンツ */}
        <div id="main-content" className="min-h-screen bg-gray-50 pt-16">
          {children}
        </div>
        
        {/* クイックアクション（フローティングメニュー） */}
        <QuickActions
          onSearch={handleSearch}
          onCompare={handleCompare}
          onFavorite={handleFavorite}
          onExport={handleExport}
          onInsights={handleInsights}
        />
        
        {/* キーボードショートカット */}
        <KeyboardShortcuts />
        
        {/* PWAインストールプロンプト */}
        <PWAInstallPrompt />
        
        {/* 通知システム */}
        <NotificationSystem />
        
        {/* NPSサーベイ（30日ごと） */}
        <NPSSurvey />
        
        {/* 分析ツール */}
        <Analytics />
        
        {/* 免責事項ダイアログ */}
        {showDisclaimer && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md animate-scale-in">
              <h2 className="text-xl font-bold mb-4">Welcome to Gap Finder</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• This tool provides market analysis for educational purposes</p>
                <p>• We respect all products and companies mentioned</p>
                <p>• Analysis focuses on opportunities, not criticisms</p>
                <p>• Use insights as inspiration for innovation</p>
              </div>
              <button 
                onClick={handleDisclaimerAccept}
                className="mt-4 w-full btn-primary btn-md"
              >
                I Understand
              </button>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}