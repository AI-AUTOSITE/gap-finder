// src/lib/data/dataLoader.ts
import { MasterIndex, CategoryMeta, CompetitorAnalysis } from './dataStructure';

export class DataLoader {
  private cache: Map<string, any> = new Map();
  private index: MasterIndex | null = null;
  private readonly MAX_CACHE_SIZE = 50; // メモリ管理

  // 初期化（インデックスのみロード）
  async initialize(): Promise<MasterIndex> {
    if (this.index) return this.index;

    try {
      const response = await fetch('/data/index.json');
      this.index = await response.json();
      
      // IndexedDBにキャッシュ
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        await this.cacheToIndexedDB('index', this.index);
      }
      
      return this.index;
    } catch (error) {
      console.error('Failed to load index:', error);
      // オフラインフォールバック
      return this.loadFromIndexedDB('index') || this.getDefaultIndex();
    }
  }

  // カテゴリデータの遅延ロード
  async loadCategory(categoryId: string): Promise<any> {
    const cacheKey = `category_${categoryId}`;
    
    // メモリキャッシュチェック
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // IndexedDBチェック
    const cached = await this.loadFromIndexedDB(cacheKey);
    if (cached && this.isFresh(cached)) {
      this.addToCache(cacheKey, cached);
      return cached;
    }

    // ネットワークから取得
    if (!this.index) await this.initialize();
    
    const category = this.index?.categories.find(c => c.id === categoryId);
    if (!category) throw new Error(`Category ${categoryId} not found`);

    try {
      const response = await fetch(category.file);
      const data = await response.json();
      
      // キャッシュに保存
      this.addToCache(cacheKey, data);
      await this.cacheToIndexedDB(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error(`Failed to load category ${categoryId}:`, error);
      return cached || null;
    }
  }

  // 個別ツール詳細の遅延ロード
  async loadToolDetail(toolId: string): Promise<CompetitorAnalysis | null> {
    const cacheKey = `tool_${toolId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`/data/tools/${toolId}.json`);
      const data = await response.json();
      
      // 免責事項を確実に追加（理念準拠）
      data.disclaimer = data.disclaimer || 
        "This analysis is for educational purposes only. Not intended to criticize any products.";
      
      this.addToCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Tool ${toolId} not found:`, error);
      return null;
    }
  }

  // メモリキャッシュ管理
  private addToCache(key: string, data: any): void {
    // キャッシュサイズ制限
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, data);
  }

  // キャッシュ鮮度チェック
  private isFresh(data: any, maxAge = 7 * 24 * 60 * 60 * 1000): boolean {
    if (!data.lastUpdated) return false;
    const lastUpdated = new Date(data.lastUpdated);
    return Date.now() - lastUpdated.getTime() < maxAge;
  }

  // IndexedDB操作
  private async cacheToIndexedDB(key: string, data: any): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const db = await this.openDB();
      const tx = db.transaction(['cache'], 'readwrite');
      const store = tx.objectStore('cache');
      await store.put({ key, data, timestamp: Date.now() });
    } catch (error) {
      console.error('IndexedDB cache error:', error);
    }
  }

  private async loadFromIndexedDB(key: string): Promise<any> {
    if (typeof window === 'undefined') return null;
    
    try {
      const db = await this.openDB();
      const tx = db.transaction(['cache'], 'readonly');
      const store = tx.objectStore('cache');
      const result = await store.get(key);
      return result?.data || null;
    } catch (error) {
      console.error('IndexedDB load error:', error);
      return null;
    }
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GapFinderDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  private getDefaultIndex(): MasterIndex {
    return {
      version: '3.0.0',
      lastUpdated: new Date().toISOString(),
      categories: [],
      totalTools: 0,
      searchIndex: '/data/search-index.json'
    };
  }

  // プリロード戦略
  async preloadPopularTools(): Promise<void> {
    const popularIds = ['canva', 'notion', 'figma', 'chatgpt', 'github'];
    
    // バックグラウンドでロード
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        popularIds.forEach(id => this.loadToolDetail(id));
      });
    } else {
      setTimeout(() => {
        popularIds.forEach(id => this.loadToolDetail(id));
      }, 1000);
    }
  }
}

// シングルトンインスタンス
export const dataLoader = new DataLoader();