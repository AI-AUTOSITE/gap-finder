import { useState, useEffect } from 'react';

/**
 * デバウンスフック
 * 入力値の変更を指定時間遅延させる
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // タイマーをセット
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // クリーンアップ
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * デバウンス関数フック
 * 関数の実行を指定時間遅延させる
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimer(newTimer);
  }) as T;

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  return debouncedCallback;
}

/**
 * スロットル関数フック
 * 関数の実行頻度を制限する
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const [lastRun, setLastRun] = useState(0);

  const throttledCallback = ((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastRun >= delay) {
      callback(...args);
      setLastRun(now);
    }
  }) as T;

  return throttledCallback;
}