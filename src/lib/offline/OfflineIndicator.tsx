// src/components/offline/OfflineIndicator.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff, 
  Check, 
  AlertCircle,
  X,
  ChevronDown,
  Download,
  RefreshCw
} from 'lucide-react';
import { getOfflineManager } from '@/lib/offline/offlineManager';
import type { OfflineStatus } from '@/types';

export function OfflineIndicator() {
  const [status, setStatus] = useState<OfflineStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const manager = getOfflineManager();
    
    // 初期状態を取得
    updateStatus();
    
    // オンライン/オフライン状態の監視
    const handleOnline = () => {
      updateStatus();
      showNotification('Back online! Syncing data...', 'success');
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 5000);
    };
    
    const handleOffline = () => {
      updateStatus();
      showNotification('You\'re offline. Gap Finder still works!', 'info');
      setIsVisible(true);
    };
    
    // カスタムイベントの監視
    const handleNotification = (event: CustomEvent) => {
      showNotification(event.detail.message, event.detail.type);
    };
    
    const handleDataSynced = () => {
      updateStatus();
      showNotification('Data synced successfully!', 'success');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-notification' as any, handleNotification);
    window.addEventListener('data-synced' as any, handleDataSynced);
    
    // 定期的に状態を更新
    const interval = setInterval(updateStatus, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-notification' as any, handleNotification);
      window.removeEventListener('data-synced' as any, handleDataSynced);
      clearInterval(interval);
    };
  }, []);
  
  async function updateStatus() {
    const manager = getOfflineManager();
    const newStatus = await manager.getOfflineStatus();
    setStatus(newStatus);
  }
  
  function showNotification(message: string, type: 'success' | 'info' | 'warning' | 'error') {
    setNotification({ message, type });
    setIsVisible(true);
    
    // 自動的に非表示
    setTimeout(() => {
      setNotification(null);
      if (status?.isOnline) {
        setIsVisible(false);
      }
    }, 5000);
  }
  
  async function handleSync() {
    setIsSyncing(true);
    const manager = getOfflineManager();
    
    try {
      await manager.syncPendingData();
      await manager.fetchLatestData();
      await updateStatus();
      showNotification('Data synced successfully!', 'success');
    } catch (error) {
      showNotification('Sync failed. Please try again.', 'error');
    } finally {
      setIsSyncing(false);
    }
  }
  
  if (!status) return null;
  
  const getNotificationColor = () => {
    if (notification) {
      switch (notification.type) {
        case 'success': return 'bg-green-500';
        case 'error': return 'bg-red-500';
        case 'warning': return 'bg-yellow-500';
        default: return 'bg-blue-500';
      }
    }
    return status.isOnline ? 'bg-green-500' : 'bg-orange-500';
  };
  
  const getNotificationIcon = () => {
    if (notification) {
      switch (notification.type) {
        case 'success': return <Check className="h-4 w-4" />;
        case 'error': return <AlertCircle className="h-4 w-4" />;
        case 'warning': return <AlertCircle className="h-4 w-4" />;
        default: return status.isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
      }
    }
    return status.isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
  };
  
  return (
    <>
      {/* Main Status Indicator (always visible in header) */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
          status.isOnline 
            ? 'bg-green-100 text-green-700' 
            : 'bg-orange-100 text-orange-700'
        }`}>
          {status.isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span className="hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span className="hidden sm:inline">Offline</span>
            </>
          )}
          
          {/* Cached tools count */}
          <span className="text-xs opacity-75">
            ({status.cachedTools} cached)
          </span>
        </div>
        
        {/* Sync button */}
        {status.isOnline && status.queuedActions > 0 && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
            title={`Sync ${status.queuedActions} pending actions`}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
      
      {/* Notification Banner */}
      {isVisible && (
        <div className={`fixed top-0 left-0 right-0 z-50 ${getNotificationColor()} text-white transition-transform transform ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getNotificationIcon()}
                <span className="font-medium">
                  {notification?.message || (status.isOnline ? 'Connected' : 'Offline Mode')}
                </span>
                
                {/* Additional info */}
                {!status.isOnline && (
                  <span className="text-sm opacity-90">
                    • {status.cachedTools} tools available offline
                  </span>
                )}
                
                {status.queuedActions > 0 && (
                  <span className="text-sm opacity-90">
                    • {status.queuedActions} actions pending sync
                  </span>
                )}
              </div>
              
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Detailed Status Panel (expandable) */}
      {!status.isOnline && (
        <OfflineStatusPanel status={status} onSync={handleSync} />
      )}
    </>
  );
}

// Detailed offline status panel
function OfflineStatusPanel({ status, onSync }: { status: OfflineStatus; onSync: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-white rounded-lg shadow-xl border border-orange-200 overflow-hidden max-w-sm">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CloudOff className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-orange-900">Offline Mode Active</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-orange-600 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} />
        </button>
        
        {isExpanded && (
          <div className="p-4 space-y-3">
            {/* Last sync */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last sync:</span>
              <span className="font-medium">{formatDate(status.lastSync)}</span>
            </div>
            
            {/* Cached tools */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Cached tools:</span>
              <span className="font-medium">{status.cachedTools}</span>
            </div>
            
            {/* Pending actions */}
            {status.queuedActions > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pending actions:</span>
                <span className="font-medium text-orange-600">{status.queuedActions}</span>
              </div>
            )}
            
            {/* Storage usage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Storage used:</span>
                <span className="font-medium">{status.storageUsed}MB / {status.storageLimit}MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${(status.storageUsed / status.storageLimit) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="pt-2 space-y-2">
              <p className="text-xs text-gray-500">
                You can continue searching and analyzing tools offline. 
                Your actions will sync when you're back online.
              </p>
              
              {status.queuedActions > 0 && (
                <button
                  onClick={onSync}
                  className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg 
                           text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Try to Sync Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export a simplified version for the header
export function SimpleOfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  
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
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
      isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
    }`}>
      {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
}