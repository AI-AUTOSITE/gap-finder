/**
 * 通知サービス
 * ブラウザ通知とアプリ内通知を管理
 */

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'opportunity';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
}

class NotificationService {
  private notifications: Notification[] = [];
  private permission: NotificationPermission = 'default';
  
  constructor() {
    this.loadNotifications();
    this.requestPermission();
  }
  
  /**
   * 通知権限をリクエスト
   */
  async requestPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }
  }
  
  /**
   * 通知を送信
   */
  send(options: {
    type: Notification['type'];
    title: string;
    message: string;
    priority?: Notification['priority'];
    actionUrl?: string;
    actionLabel?: string;
  }): void {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type: options.type,
      title: options.title,
      message: options.message,
      timestamp: new Date(),
      read: false,
      priority: options.priority || 'medium',
      actionUrl: options.actionUrl,
      actionLabel: options.actionLabel
    };
    
    // 通知を保存
    this.notifications.unshift(notification);
    this.saveNotifications();
    
    // アプリ内通知を表示
    this.showInAppNotification(notification);
    
    // ブラウザ通知を表示（高優先度のみ）
    if (notification.priority === 'high' && this.permission === 'granted') {
      this.showBrowserNotification(notification);
    }
  }
  
  /**
   * アプリ内通知を表示
   */
  private showInAppNotification(notification: Notification): void {
    window.dispatchEvent(new CustomEvent('app-notification', {
      detail: {
        type: notification.type,
        message: `${notification.title}: ${notification.message}`
      }
    }));
  }
  
  /**
   * ブラウザ通知を表示
   */
  private showBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
        actions: notification.actionUrl ? [
          {
            action: 'open',
            title: notification.actionLabel || 'View'
          }
        ] : []
      });
      
      // クリックハンドラー
      browserNotif.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotif.close();
      };
      
      // 自動クローズ（低優先度）
      if (notification.priority !== 'high') {
        setTimeout(() => browserNotif.close(), 5000);
      }
    }
  }
  
  /**
   * 市場機会を検出して通知
   */
  detectOpportunities(tools: any[]): void {
    // 高ポテンシャル機会を検出
    tools.forEach(tool => {
      tool.industryGaps?.forEach((gap: any) => {
        if (gap.potential === 'very high' && gap.successProbability > 70) {
          this.send({
            type: 'opportunity',
            title: '🚀 High-Value Opportunity Detected',
            message: `${gap.gap} in ${tool.name} (${gap.successProbability}% success rate)`,
            priority: 'high',
            actionUrl: `#tool-${tool.id}`,
            actionLabel: 'View Details'
          });
        }
      });
    });
    
    // トレンドを検出
    const commonComplaints = this.findCommonComplaints(tools);
    if (commonComplaints.length > 0) {
      const topComplaint = commonComplaints[0];
      this.send({
        type: 'info',
        title: '📊 Market Trend Alert',
        message: `${topComplaint.percentage}% of tools have issues with "${topComplaint.issue}"`,
        priority: 'medium'
      });
    }
  }
  
  /**
   * 共通の不満を検出
   */
  private findCommonComplaints(tools: any[]): any[] {
    const complaints = new Map<string, number>();
    
    tools.forEach(tool => {
      tool.userComplaints?.forEach((complaint: any) => {
        const key = complaint.issue.toLowerCase();
        complaints.set(key, (complaints.get(key) || 0) + 1);
      });
    });
    
    return Array.from(complaints.entries())
      .map(([issue, count]) => ({
        issue,
        count,
        percentage: Math.round((count / tools.length) * 100)
      }))
      .filter(c => c.percentage > 30)
      .sort((a, b) => b.percentage - a.percentage);
  }
  
  /**
   * 通知を既読にする
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }
  
  /**
   * すべての通知を既読にする
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }
  
  /**
   * 通知を取得
   */
  getNotifications(unreadOnly = false): Notification[] {
    if (unreadOnly) {
      return this.notifications.filter(n => !n.read);
    }
    return this.notifications;
  }
  
  /**
   * 未読通知数を取得
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
  
  /**
   * 通知をクリア
   */
  clearNotifications(olderThanDays = 7): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    this.notifications = this.notifications.filter(n => 
      n.timestamp > cutoffDate || !n.read
    );
    
    this.saveNotifications();
  }
  
  /**
   * LocalStorageから通知を読み込み
   */
  private loadNotifications(): void {
    const saved = localStorage.getItem('gapFinderNotifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.notifications = parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    }
  }
  
  /**
   * LocalStorageに通知を保存
   */
  private saveNotifications(): void {
    // 最新100件のみ保存
    const toSave = this.notifications.slice(0, 100);
    localStorage.setItem('gapFinderNotifications', JSON.stringify(toSave));
  }
}

// シングルトンインスタンス
export const notificationService = new NotificationService();

// 便利な関数
export function notifySuccess(title: string, message: string): void {
  notificationService.send({ type: 'success', title, message });
}

export function notifyError(title: string, message: string): void {
  notificationService.send({ type: 'error', title, message, priority: 'high' });
}

export function notifyOpportunity(title: string, message: string, actionUrl?: string): void {
  notificationService.send({ 
    type: 'opportunity', 
    title, 
    message, 
    priority: 'high',
    actionUrl,
    actionLabel: 'Explore Opportunity'
  });
}