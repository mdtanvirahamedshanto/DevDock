import { Client } from 'pg';
import { IDatabaseDriver, DbConnectionConfig, DbQueryResult } from '../types';

export class PostgresDriver implements IDatabaseDriver {
  private client: Client | null = null;

  async connect(config: DbConnectionConfig): Promise<void> {
    this.client = new Client({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionString: config.connectionString,
    });
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }

  async query(sql: string): Promise<DbQueryResult> {
    if (!this.client) throw new Error('Not connected');
    const start = performance.now();
    const result = await this.client.query(sql);
    const executionTimeMs = performance.now() - start;

    return {
      rows: result.rows,
      fields: result.fields.map((f: any) => f.name),
      rowCount: result.rowCount || 0,
      executionTimeMs,
    };
  }

  async getTables(): Promise<string[]> {
    const res = await this.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';
    `);
    return res.rows.map((r) => r.tablename);
  }
}
