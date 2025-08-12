// src/lib/offline/offlineManager.ts
import localforage from 'localforage';
import type { CompetitorData, SearchResult, OfflineStatus } from '@/types';

/**
 * オフラインストレージマネージャー
 * IndexedDBを使用してデータを永続化
 */
export class OfflineManager {
  private competitorsStore: LocalForage;
  private searchHistoryStore: LocalForage;
  private userDataStore: LocalForage;
  private syncQueue: LocalForage;
  
  constructor() {
    // 競合データストア
    this.competitorsStore = localforage.createInstance({
      name: 'GapFinder',
      storeName: 'competitors',
      description: 'Competitor analysis data'
    });
    
    // 検索履歴ストア
    this.searchHistoryStore = localforage.createInstance({
      name: 'GapFinder',
      storeName: 'searchHistory',
      description: 'User search history'
    });
    
    // ユーザーデータストア
    this.userDataStore = localforage.createInstance({
      name: 'GapFinder',
      storeName: 'userData',
      description: 'User preferences and settings'
    });
    
    // 同期キュー
    this.syncQueue = localforage.createInstance({
      name: 'GapFinder',
      storeName: 'syncQueue',
      description: 'Queued actions for sync'
    });
    
    // Service Worker登録
    this.registerServiceWorker();
    
    // オンライン/オフライン監視
    this.setupNetworkMonitoring();
  }
  
  // ================== Service Worker管理 ==================
  
  /**
   * Service Workerの登録
   */
  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[OfflineManager] ServiceWorker registered:', registration.scope);
        
        // Service Workerからのメッセージを監視
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });
        
        // 更新チェック
        registration.addEventListener('updatefound', () => {
          console.log('[OfflineManager] New ServiceWorker available');
        });
      } catch (error) {
        console.error('[OfflineManager] ServiceWorker registration failed:', error);
      }
    }
  }
  
  /**
   * Service Workerからのメッセージ処理
   */
  private handleServiceWorkerMessage(data: any) {
    switch (data.type) {
      case 'DATA_SYNCED':
        console.log('[OfflineManager] Data synced at:', data.timestamp);
        this.notifyDataSync();
        break;
      case 'CACHE_UPDATED':
        console.log('[OfflineManager] Cache updated');
        break;
      default:
        console.log('[OfflineManager] Unknown message:', data);
    }
  }
  
  // ================== ネットワーク監視 ==================
  
  /**
   * ネットワーク状態の監視設定
   */
  private setupNetworkMonitoring() {
    // オンライン復帰時
    window.addEventListener('online', () => {
      console.log('[OfflineManager] Back online');
      this.syncPendingData();
      this.showNotification('Back online! Syncing data...', 'success');
    });
    
    // オフライン移行時
    window.addEventListener('offline', () => {
      console.log('[OfflineManager] Gone offline');
      this.showNotification('You\'re offline. Gap Finder still works!', 'info');
    });
  }
  
  /**
   * 現在のオフライン状態を取得
   */
  async getOfflineStatus(): Promise<OfflineStatus> {
    const cachedTools = await this.getToolCount();
    const queuedActions = await this.getQueuedActionCount();
    const lastSync = await this.getLastSyncTime();
    const storageUsed = await this.getStorageUsage();
    
    return {
      isOnline: navigator.onLine,
      lastSync: lastSync || new Date(),
      cachedTools,
      queuedActions,
      syncProgress: undefined,
      storageUsed,
      storageLimit: 50 // MB
    };
  }
  
  // ================== データ管理 ==================
  
  /**
   * 競合データを保存
   */
  async saveCompetitors(competitors: CompetitorData[]): Promise<void> {
    const promises = competitors.map(competitor => 
      this.competitorsStore.setItem(competitor.id, competitor)
    );
    
    await Promise.all(promises);
    await this.userDataStore.setItem('lastDataUpdate', new Date().toISOString());
    console.log(`[OfflineManager] Saved ${competitors.length} competitors`);
  }
  
  /**
   * 競合データを取得
   */
  async getCompetitor(id: string): Promise<CompetitorData | null> {
    return await this.competitorsStore.getItem(id);
  }
  
  /**
   * すべての競合データを取得
   */
  async getAllCompetitors(): Promise<CompetitorData[]> {
    const competitors: CompetitorData[] = [];
    
    await this.competitorsStore.iterate((value: CompetitorData) => {
      competitors.push(value);
    });
    
    return competitors;
  }
  
  /**
   * 検索履歴を保存
   */
  async saveSearchHistory(query: string, results: SearchResult[]): Promise<void> {
    const history = await this.getSearchHistory();
    
    history.unshift({
      id: Date.now().toString(),
      query,
      results: results.map(r => r.tool.id),
      timestamp: new Date().toISOString(),
      resultCount: results.length
    });
    
    // 最新50件のみ保持
    const recentHistory = history.slice(0, 50);
    await this.searchHistoryStore.setItem('history', recentHistory);
  }
  
  /**
   * 検索履歴を取得
   */
  async getSearchHistory(): Promise<any[]> {
    const history = await this.searchHistoryStore.getItem<any[]>('history');
    return history || [];
  }
  
  // ================== 同期管理 ==================
  
  /**
   * アクションをキューに追加
   */
  async queueAction(action: {
    type: 'search' | 'feedback' | 'request' | 'export';
    data: any;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<void> {
    const id = Date.now().toString();
    
    await this.syncQueue.setItem(id, {
      id,
      type: action.type,
      data: action.data,
      timestamp: new Date(),
      priority: action.priority || 'medium',
      retries: 0
    });
    
    // オンラインなら即座に同期
    if (navigator.onLine) {
      this.syncPendingData();
    }
  }
  
  /**
   * 保留中のデータを同期
   */
  async syncPendingData(): Promise<void> {
    if (!navigator.onLine) return;
    
    const actions: any[] = [];
    
    await this.syncQueue.iterate((value: any) => {
      actions.push(value);
    });
    
    // 優先度でソート
    actions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // 各アクションを処理
    for (const action of actions) {
      try {
        await this.processSyncAction(action);
        await this.syncQueue.removeItem(action.id);
      } catch (error) {
        console.error('[OfflineManager] Sync failed for action:', action.id, error);
        
        // リトライ回数を増やす
        action.retries++;
        if (action.retries >= 3) {
          // 3回失敗したら削除
          await this.syncQueue.removeItem(action.id);
        } else {
          await this.syncQueue.setItem(action.id, action);
        }
      }
    }
    
    // 最新データを取得
    await this.fetchLatestData();
  }
  
  /**
   * 同期アクションを処理
   */
  private async processSyncAction(action: any): Promise<void> {
    switch (action.type) {
      case 'search':
        // 検索ログを送信
        await fetch('/api/analytics/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;
        
      case 'feedback':
        // フィードバックを送信
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;
        
      case 'request':
        // ツールリクエストを送信
        await fetch('/api/tools/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;
        
      default:
        console.warn('[OfflineManager] Unknown action type:', action.type);
    }
  }
  
  /**
   * 最新データを取得
   */
  async fetchLatestData(): Promise<void> {
    try {
      const response = await fetch('/data/competitors.json');
      if (response.ok) {
        const data = await response.json();
        await this.saveCompetitors(data.tools);
        console.log('[OfflineManager] Latest data fetched and saved');
      }
    } catch (error) {
      console.error('[OfflineManager] Failed to fetch latest data:', error);
    }
  }
  
  // ================== ユーティリティ ==================
  
  /**
   * キャッシュをクリア
   */
  async clearCache(): Promise<void> {
    await this.competitorsStore.clear();
    await this.searchHistoryStore.clear();
    console.log('[OfflineManager] Cache cleared');
  }
  
  /**
   * ストレージ使用量を取得（MB）
   */
  private async getStorageUsage(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return Math.round((estimate.usage || 0) / 1024 / 1024);
    }
    return 0;
  }
  
  /**
   * ツール数を取得
   */
  private async getToolCount(): Promise<number> {
    let count = 0;
    await this.competitorsStore.iterate(() => {
      count++;
    });
    return count;
  }
  
  /**
   * キューに入っているアクション数を取得
   */
  private async getQueuedActionCount(): Promise<number> {
    let count = 0;
    await this.syncQueue.iterate(() => {
      count++;
    });
    return count;
  }
  
  /**
   * 最終同期時刻を取得
   */
  private async getLastSyncTime(): Promise<Date | null> {
    const lastUpdate = await this.userDataStore.getItem<string>('lastDataUpdate');
    return lastUpdate ? new Date(lastUpdate) : null;
  }
  
  /**
   * 通知を表示
   */
  private showNotification(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') {
    // カスタムイベントを発火（UIコンポーネントで監視）
    window.dispatchEvent(new CustomEvent('offline-notification', {
      detail: { message, type }
    }));
  }
  
  /**
   * データ同期完了を通知
   */
  private notifyDataSync() {
    window.dispatchEvent(new CustomEvent('data-synced', {
      detail: { timestamp: new Date().toISOString() }
    }));
  }
}

// シングルトンインスタンス
let offlineManagerInstance: OfflineManager | null = null;

/**
 * OfflineManagerのインスタンスを取得
 */
export function getOfflineManager(): OfflineManager {
  if (!offlineManagerInstance) {
    offlineManagerInstance = new OfflineManager();
  }
  return offlineManagerInstance;
}

/**
 * オフライン対応の初期化
 */
export async function initializeOfflineSupport(): Promise<void> {
  const manager = getOfflineManager();
  
  // 初回データロード
  if ((await manager.getOfflineStatus()).cachedTools === 0) {
    console.log('[OfflineManager] Initial data load...');
    await manager.fetchLatestData();
  }
  
  // バックグラウンド同期の登録
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await (registration as any).sync.register('sync-data');
      console.log('[OfflineManager] Background sync registered');
    } catch (error) {
      console.log('[OfflineManager] Background sync not available');
    }
  }
}