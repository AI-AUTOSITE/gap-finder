const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // swcMinifyをPWA設定から削除
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15対応
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // 画像最適化
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
  },
  
  // パフォーマンス最適化
  compress: true,
  poweredByHeader: false,
  // swcMinifyを削除（Next.js 15ではデフォルトで有効）
  
  // 静的ファイル最適化
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // ESLint設定
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src']
  },
  
  // TypeScript設定
  typescript: {
    ignoreBuildErrors: false
  },
  
  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Service Workerの適切なキャッシュ制御
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);