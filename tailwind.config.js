/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Gap Finderブランドカラー
        brand: {
          50: '#eff6ff',
          100: '#dbeafe', 
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // メインブルー
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // 分析カテゴリ別カラー
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706', 
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // グレースケール調整
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        // 既存のアニメーション
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounceSoft 2s infinite',
        
        // 新規追加アニメーション（モーダル用）
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'modal-fade': 'modalFade 0.2s ease-out',
        'modal-scale': 'modalScale 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        // 既存のキーフレーム
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        skeleton: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        
        // 新規追加キーフレーム（モーダル用）
        scaleIn: {
          '0%': { 
            transform: 'scale(0.9)',
            opacity: '0' 
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1' 
          },
        },
        slideIn: {
          '0%': { 
            transform: 'translateX(100%)',
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: '1' 
          },
        },
        modalFade: {
          '0%': { 
            opacity: '0',
            backdropFilter: 'blur(0px)'
          },
          '100%': { 
            opacity: '1',
            backdropFilter: 'blur(8px)'
          },
        },
        modalScale: {
          '0%': { 
            transform: 'scale(0.95) translateY(10px)',
            opacity: '0' 
          },
          '50%': { 
            transform: 'scale(1.02) translateY(-5px)',
          },
          '100%': { 
            transform: 'scale(1) translateY(0)',
            opacity: '1' 
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      screens: {
        'xs': '475px',
      },
      // z-indexの追加（モーダル階層管理）
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // ボックスシャドウの追加
      boxShadow: {
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'header': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'float': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [
    // カスタムプラグインで頻用するスタイルを定義
    function({ addUtilities, addComponents }) {
      // ユーティリティクラス
      addUtilities({
        '.gpu-accelerated': {
          transform: 'translateZ(0)',
          'will-change': 'transform',
        },
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
      });
      
      // コンポーネントクラス
      addComponents({
        // モーダル背景のスタイル
        '.modal-backdrop': {
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: '50',
        },
        // ヘッダーの固定スタイル
        '.header-sticky': {
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          zIndex: '50',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
        // フローティングボタンスタイル
        '.floating-button': {
          position: 'fixed',
          padding: '0.75rem',
          borderRadius: '9999px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        },
      });
    },
  ],
}