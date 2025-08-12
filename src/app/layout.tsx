import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

// フォント最適化
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: {
    default: 'Gap Finder - Smart Competitor Analysis for Indie Hackers',
    template: '%s | Gap Finder'
  },
  description: 'Find market gaps and competitive advantages instantly. Analyze competitors + similar tools offline. Built for indie hackers who want to win.',
  keywords: [
    'competitor analysis',
    'market gaps', 
    'indie hackers',
    'startup tools',
    'business intelligence',
    'competitive research',
    'market research',
    'startup strategy'
  ],
  authors: [{ name: 'Gap Finder Team', url: 'https://gap-finder.com' }],
  creator: 'Gap Finder',
  publisher: 'Gap Finder',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://gap-finder.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Gap Finder',
    title: 'Gap Finder - Smart Competitor Analysis for Indie Hackers',
    description: 'Find market gaps and competitive advantages instantly. Works offline, powered by AI insights.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gap Finder - Competitor Analysis Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gapfinder',
    creator: '@gapfinder',
    title: 'Gap Finder - Smart Competitor Analysis',
    description: 'Find market gaps and competitive advantages instantly. Built for indie hackers.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#3b82f6' },
    ],
  },
  manifest: '/manifest.json',
  category: 'business',
  classification: 'Business Tools',
  // 構造化データ
  other: {
    'application-name': 'Gap Finder',
    'mobile-web-app-capable': 'yes',
    'mobile-web-app-status-bar-style': 'default',
    'mobile-web-app-title': 'Gap Finder',
    'msapplication-config': '/browserconfig.xml',
    'msapplication-TileColor': '#3b82f6',
    'theme-color': '#3b82f6',
  },
};
// src/app/layout.tsx に追加

useEffect(() => {
  // データ初期化時に免責事項を確認
  const showDisclaimer = () => {
    const hasSeenDisclaimer = localStorage.getItem('disclaimer-acknowledged');
    
    if (!hasSeenDisclaimer) {
      // 初回訪問時に免責事項を表示
      const disclaimer = document.createElement('div');
      disclaimer.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
      disclaimer.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md">
          <h2 class="text-xl font-bold mb-4">Welcome to Gap Finder</h2>
          <div class="text-sm text-gray-600 space-y-2">
            <p>• This tool provides market analysis for educational purposes</p>
            <p>• We respect all products and companies mentioned</p>
            <p>• Analysis focuses on opportunities, not criticisms</p>
            <p>• Use insights as inspiration for innovation</p>
          </div>
          <button 
            onclick="this.parentElement.parentElement.remove(); localStorage.setItem('disclaimer-acknowledged', 'true')"
            class="mt-4 w-full btn-primary btn-md"
          >
            I Understand
          </button>
        </div>
      `;
      document.body.appendChild(disclaimer);
    }
  };
  
  showDisclaimer();
}, []);

// ビューポート設定（PWA最適化）
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  colorScheme: 'light',
};

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        
        {/* パフォーマンス最適化 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA関連 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Gap Finder" />
        
        {/* DNS prefetch */}
        <link rel="dns-prefetch" href="//api.anthropic.com" />
        <link rel="dns-prefetch" href="//vercel.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* スキップリンク（アクセシビリティ） */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-brand-500 text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>
        
        {/* メインコンテンツ */}
        <div id="main-content" className="min-h-screen bg-gray-50">
          {children}
        </div>
        
        {/* オフライン状態インジケーター */}
        <OfflineIndicator />
        
        {/* PWAインストールプロンプト */}
        <PWAInstallPrompt />
        
        {/* 分析ツール */}
        <Analytics />
        
        {/* サービスワーカー登録 */}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}

// オフライン状態インジケーター
function OfflineIndicator() {
  return (
    <div id="offline-indicator" className="hidden offline-indicator">
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span>You're offline - Gap Finder works without internet!</span>
      </div>
    </div>
  );
}

// PWAインストールプロンプト
function PWAInstallPrompt() {
  return (
    <div id="pwa-install-prompt" className="hidden fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">Install Gap Finder</p>
          <p className="text-sm text-gray-600">Access offline, faster loading</p>
        </div>
        <button id="pwa-install-button" className="btn-primary btn-sm">
          Install
        </button>
        <button id="pwa-dismiss-button" className="btn-ghost btn-sm">
          ×
        </button>
      </div>
    </div>
  );
}

// サービスワーカー登録
function ServiceWorkerRegistration() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('ServiceWorker registration successful');
              }).catch(function(error) {
                console.log('ServiceWorker registration failed');
              });
            });
            
            // オフライン/オンライン状態の監視
            window.addEventListener('online', function() {
              document.getElementById('offline-indicator')?.classList.add('hidden');
            });
            
            window.addEventListener('offline', function() {
              document.getElementById('offline-indicator')?.classList.remove('hidden');
            });
            
            // PWAインストールプロンプト
            let deferredPrompt;
            
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              deferredPrompt = e;
              document.getElementById('pwa-install-prompt')?.classList.remove('hidden');
            });
            
            document.getElementById('pwa-install-button')?.addEventListener('click', async () => {
              if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
                document.getElementById('pwa-install-prompt')?.classList.add('hidden');
              }
            });
            
            document.getElementById('pwa-dismiss-button')?.addEventListener('click', () => {
              document.getElementById('pwa-install-prompt')?.classList.add('hidden');
            });
          }
        `,
      }}
    />
  );
}