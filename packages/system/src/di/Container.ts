export class Container {
  private services = new Map<string, any>();

  public register<T>(key: string, instance: T): void {
    if (this.services.has(key)) {
      throw new Error(`Service ${key} is already registered.`);
    }
    this.services.set(key, instance);
  }

  public resolve<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} not found.`);
    }
    return service as T;
  }

  public clear(): void {
    this.services.clear();
  }
}

export const container = new Container();
