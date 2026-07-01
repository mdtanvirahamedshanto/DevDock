import { IDatabaseDriver, DbConnectionConfig, DbQueryResult } from '../types';
import { MongoClient, Db } from 'mongodb';

export class MongodbDriver implements IDatabaseDriver {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(config: DbConnectionConfig): Promise<void> {
    const url =
      config.connectionString ||
      `mongodb://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
    this.client = new MongoClient(url);
    await this.client.connect();
    this.db = this.client.db(config.database);
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  async query(sql: string): Promise<DbQueryResult> {
    throw new Error('SQL not supported in MongoDB. Use collection commands in Phase 15 expansion.');
  }

  async getTables(): Promise<string[]> {
    if (!this.db) throw new Error('Not connected');
    const collections = await this.db.listCollections().toArray();
    return collections.map((c) => c.name);
  }
}
