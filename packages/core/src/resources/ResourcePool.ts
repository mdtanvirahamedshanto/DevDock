export interface PoolItem<T> {
  id: string;
  resource: T;
  inUse: boolean;
  lastUsed: number;
}

export abstract class ResourcePool<T> {
  protected pool: Map<string, PoolItem<T>> = new Map();

  constructor(
    protected maxSize: number,
    protected idleTimeoutMs: number = 60000
  ) {
    // Start idle cleanup timer
    setInterval(() => this.cleanupIdleResources(), 10000).unref();
  }

  public async acquire(): Promise<PoolItem<T>> {
    // Find available
    for (const item of this.pool.values()) {
      if (!item.inUse && await this.isHealthy(item.resource)) {
        item.inUse = true;
        item.lastUsed = Date.now();
        return item;
      }
    }

    if (this.pool.size >= this.maxSize) {
      throw new Error('Resource pool exhausted');
    }

    // Create new
    const id = crypto.randomUUID();
    const resource = await this.createResource();
    const item: PoolItem<T> = { id, resource, inUse: true, lastUsed: Date.now() };
    this.pool.set(id, item);
    return item;
  }

  public release(id: string): void {
    const item = this.pool.get(id);
    if (item) {
      item.inUse = false;
      item.lastUsed = Date.now();
    }
  }

  protected async cleanupIdleResources(): Promise<void> {
    const now = Date.now();
    for (const [id, item] of this.pool.entries()) {
      if (!item.inUse && now - item.lastUsed > this.idleTimeoutMs) {
        await this.destroyResource(item.resource);
        this.pool.delete(id);
      }
    }
  }

  protected abstract createResource(): Promise<T>;
  protected abstract destroyResource(resource: T): Promise<void>;
  protected abstract isHealthy(resource: T): Promise<boolean>;
}
