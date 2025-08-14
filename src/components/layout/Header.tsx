'use client';

import { useState, useEffect } from 'react';
import { 
  Target, 
  Wifi, 
  WifiOff,
  Menu,
  X,
  Share2,
  MessageSquare,
  Heart,
  Download,
  Bell,
  Settings
} from 'lucide-react';
import ShareButton from '@/components/ui/ShareButton';
import FeedbackWidget from '@/components/feedback/FeedbackWidget';

interface HeaderProps {
  isOnline?: boolean;
  onMenuToggle?: () => void;
}

export default function Header({ 
  isOnline = true,
  onMenuToggle 
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [notifications, setNotifications] = useState(0);

  // スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 通知カウント（デモ用）
  useEffect(() => {
    const savedNotifications = localStorage.getItem('unreadNotifications');
    if (savedNotifications) {
      setNotifications(parseInt(savedNotifications));
    }
  }, []);

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white/80 backdrop-blur-sm'
        } border-b border-gray-200
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Gap Finder</h1>
                <p className="hidden sm:block text-xs text-gray-600">Smart Analysis</p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Quick Actions */}
              <div className="flex items-center gap-1 mr-2">
                {/* Share Button */}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all group"
                  title="Share"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Share
                  </span>
                </button>

                {/* Feedback Button */}
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all group"
                  title="Feedback"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1.5 right-1.5 animate-pulse"></span>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Feedback
                  </span>
                </button>

                {/* Favorites Button */}
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('toggle-favorites'));
                  }}
                  className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group"
                  title="Favorites"
                >
                  <Heart className="h-5 w-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Favorites
                  </span>
                </button>

                {/* Export Button */}
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('toggle-export'));
                  }}
                  className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all group"
                  title="Export"
                >
                  <Download className="h-5 w-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Export
                  </span>
                </button>

                {/* Notifications */}
                <button
                  className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all group"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Notifications
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-200 mx-2" />

              {/* Status & Actions */}
              <div className="flex items-center gap-3">
                {/* Connection Status */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                  <span className="hidden lg:inline text-xs font-medium">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                {/* Settings */}
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                  <Settings className="h-5 w-5" />
                </button>

                {/* Upgrade Button */}
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg">
                  Upgrade to Pro
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 animate-slide-down">
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button
                  onClick={() => {
                    setShowShareModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Share2 className="h-5 w-5 text-gray-600" />
                  <span className="text-xs">Share</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowFeedbackModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-lg transition-colors relative"
                >
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  <span className="absolute w-2 h-2 bg-red-500 rounded-full top-2 right-2"></span>
                  <span className="text-xs">Feedback</span>
                </button>
                
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('toggle-favorites'));
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Heart className="h-5 w-5 text-gray-600" />
                  <span className="text-xs">Favorites</span>
                </button>
                
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('toggle-export'));
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Download className="h-5 w-5 text-gray-600" />
                  <span className="text-xs">Export</span>
                </button>
              </div>
              
              <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium">
                Upgrade to Pro
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      {showShareModal && (
        <ShareModal onClose={() => setShowShareModal(false)} />
      )}
      
      {showFeedbackModal && (
        <FeedbackModal onClose={() => setShowFeedbackModal(false)} />
      )}
    </>
  );
}

// Share Modal Component
function ShareModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    // ESCキーで閉じる
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose} // 背景クリックで閉じる
    >
      <div 
        className="relative animate-scale-in"
        onClick={(e) => e.stopPropagation()} // モーダル内クリックは閉じない
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
        
        <ShareButton variant="button" />
      </div>
    </div>
  );
}

// Feedback Modal Component
function FeedbackModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    // ESCキーで閉じる
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose} // 背景クリックで閉じる
    >
      <div 
        className="relative animate-scale-in"
        onClick={(e) => e.stopPropagation()} // モーダル内クリックは閉じない
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
        
        <FeedbackWidget variant="embedded" />
      </div>
    </div>
  );
}