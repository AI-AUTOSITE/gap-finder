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
  Settings,
  Twitter,
  Linkedin,
  Mail,
  Copy,
  Check,
  Star,
  Send,
  ThumbsUp,
  ThumbsDown,
  Bug,
  Lightbulb,
  CheckCircle,
  Plus,
  FileText,
  ChevronRight
} from 'lucide-react';

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
  const [showFavoritesPanel, setShowFavoritesPanel] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  // スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // お気に入りの読み込み
  useEffect(() => {
    const savedFavorites = localStorage.getItem('gapFinderFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // イベントリスナー
  useEffect(() => {
    const handleToggleFavorites = () => setShowFavoritesPanel(true);
    const handleToggleExport = () => setShowExportPanel(true);
    
    window.addEventListener('toggle-favorites', handleToggleFavorites);
    window.addEventListener('toggle-export', handleToggleExport);
    
    return () => {
      window.removeEventListener('toggle-favorites', handleToggleFavorites);
      window.removeEventListener('toggle-export', handleToggleExport);
    };
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
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
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
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Feedback
                  </span>
                </button>

                {/* Favorites Button */}
                <button
                  onClick={() => setShowFavoritesPanel(true)}
                  className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group"
                  title="Favorites"
                >
                  <Heart className="h-5 w-5" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Favorites
                  </span>
                </button>

                {/* Export Button */}
                <button
                  onClick={() => setShowExportPanel(true)}
                  className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all group"
                  title="Export"
                >
                  <Download className="h-5 w-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
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
                    setShowFavoritesPanel(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Heart className="h-5 w-5 text-gray-600" />
                  <span className="text-xs">Favorites</span>
                  {favorites.length > 0 && (
                    <span className="text-xs text-red-600">({favorites.length})</span>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setShowExportPanel(true);
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

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          onClose={() => setShowShareModal(false)}
          url={typeof window !== 'undefined' ? window.location.href : ''}
        />
      )}
      
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal onClose={() => setShowFeedbackModal(false)} />
      )}

      {/* Favorites Panel */}
      {showFavoritesPanel && (
        <FavoritesPanel 
          favorites={favorites}
          setFavorites={setFavorites}
          onClose={() => setShowFavoritesPanel(false)} 
        />
      )}

      {/* Export Panel */}
      {showExportPanel && (
        <ExportPanel onClose={() => setShowExportPanel(false)} />
      )}
    </>
  );
}

// Share Modal Component
function ShareModal({ onClose, url }: { onClose: () => void; url: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: 'X (Twitter)',
      icon: <Twitter className="h-5 w-5" />,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=Check out Gap Finder!&url=${encodeURIComponent(url)}`, '_blank');
      }
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="h-5 w-5" />,
      color: 'hover:bg-blue-50 hover:text-blue-700',
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
      }
    },
    {
      name: 'Email',
      icon: <Mail className="h-5 w-5" />,
      color: 'hover:bg-gray-50 hover:text-gray-700',
      action: () => {
        window.location.href = `mailto:?subject=Gap Finder&body=${encodeURIComponent(url)}`;
      }
    },
    {
      name: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />,
      color: copied ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 hover:text-gray-700',
      action: handleCopy
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Share Gap Finder</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${option.color}`}
              >
                {option.icon}
                <span className="text-sm font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Feedback Modal Component
function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature'>('general');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {isSubmitted ? (
          <div className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Thank you for your feedback!</p>
            <p className="text-sm text-gray-600 mt-2">We really appreciate it 💙</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Send Feedback</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setFeedbackType('general')}
                  className={`flex-1 p-2 rounded-lg text-sm font-medium transition-colors ${
                    feedbackType === 'general' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mx-auto mb-1" />
                  General
                </button>
                <button
                  onClick={() => setFeedbackType('bug')}
                  className={`flex-1 p-2 rounded-lg text-sm font-medium transition-colors ${
                    feedbackType === 'bug' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Bug className="h-4 w-4 mx-auto mb-1" />
                  Bug
                </button>
                <button
                  onClick={() => setFeedbackType('feature')}
                  className={`flex-1 p-2 rounded-lg text-sm font-medium transition-colors ${
                    feedbackType === 'feature' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Lightbulb className="h-4 w-4 mx-auto mb-1" />
                  Feature
                </button>
              </div>
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  feedbackType === 'bug' 
                    ? 'Describe the issue you encountered...'
                    : feedbackType === 'feature'
                    ? 'What feature would you like to see?'
                    : 'Share your thoughts...'
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !message.trim()}
                className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Feedback
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Favorites Panel Component
function FavoritesPanel({ 
  favorites, 
  setFavorites,
  onClose 
}: { 
  favorites: any[];
  setFavorites: (favs: any[]) => void;
  onClose: () => void;
}) {
  const removeFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('gapFinderFavorites', JSON.stringify(updated));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Favorites ({favorites.length})
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h4>
              <p className="text-sm text-gray-600 mb-4">
                Start adding tools to your favorites by clicking the heart icon on any tool card.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 text-left max-w-md mx-auto">
                <p className="text-sm text-blue-900 font-medium mb-2">How to add favorites:</p>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Browse tools in the main view</li>
                  <li>2. Click the heart icon on tools you like</li>
                  <li>3. Access them quickly from here</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((fav) => (
                <div key={fav.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{fav.name}</h4>
                    <p className="text-sm text-gray-600">{fav.category}</p>
                  </div>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export Panel Component
function ExportPanel({ onClose }: { onClose: () => void }) {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    // Simulate export
    setTimeout(() => {
      setIsExporting(false);
      // Trigger download
      const data = { message: 'Export data here' };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gap-finder-export.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    }, 1000);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Choose a format to export your analysis data:
          </p>
          
          <div className="space-y-2 mb-6">
            {(['json', 'csv', 'pdf'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                  exportFormat === format
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{format.toUpperCase()}</p>
                    <p className="text-xs text-gray-600">
                      {format === 'json' && 'Machine-readable format'}
                      {format === 'csv' && 'Excel compatible'}
                      {format === 'pdf' && 'Print-ready report'}
                    </p>
                  </div>
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export {exportFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}