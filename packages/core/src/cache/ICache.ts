export interface CacheOptions {
  ttlSeconds?: number;
}

export interface ICache<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
