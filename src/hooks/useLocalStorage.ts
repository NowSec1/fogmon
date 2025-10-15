import { useEffect, useState } from 'react';

export const useLocalStorage = <T,>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch (error) {
      console.warn('无法读取本地配置，将使用默认值。', error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('无法写入本地配置。', error);
    }
  }, [key, value]);

  return [value, setValue] as const;
};
