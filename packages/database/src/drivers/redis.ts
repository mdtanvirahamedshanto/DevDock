import { IDatabaseDriver, DbConnectionConfig, DbQueryResult } from '../types';
import Redis from 'ioredis';

export class RedisDriver implements IDatabaseDriver {
  private client: Redis | null = null;

  async connect(config: DbConnectionConfig): Promise<void> {
    this.client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.database ? parseInt(config.database) : 0,
    });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
  }

  async query(sql: string): Promise<DbQueryResult> {
    throw new Error('SQL not supported in Redis. Use native commands in Phase 15 expansion.');
  }

  async getTables(): Promise<string[]> {
    if (!this.client) throw new Error('Not connected');
    const keys = await this.client.keys('*');
    return keys;
  }
}
