import { ICache, CacheOptions } from './ICache';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

export class MemoryCache<T> implements ICache<T> {
  private store = new Map<string, CacheEntry<T>>();

  public async get(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  public async set(key: string, value: T, options?: CacheOptions): Promise<void> {
    const expiresAt = options?.ttlSeconds ? Date.now() + options.ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  public async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  public async clear(): Promise<void> {
    this.store.clear();
  }
}
