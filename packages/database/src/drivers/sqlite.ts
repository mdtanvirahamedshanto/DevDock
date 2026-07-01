import { IDatabaseDriver, DbConnectionConfig, DbQueryResult } from '../types';
import sqlite3 from 'sqlite3';

export class SqliteDriver implements IDatabaseDriver {
  private db: sqlite3.Database | null = null;

  async connect(config: DbConnectionConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(config.database || ':memory:', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async query(sql: string): Promise<DbQueryResult> {
    if (!this.db) throw new Error('Not connected');
    const start = Date.now();
    return new Promise((resolve, reject) => {
      this.db!.all(sql, (err, rows) => {
        if (err) reject(err);
        else
          resolve({
            rows,
            fields: rows.length > 0 ? Object.keys(rows[0]) : [],
            rowCount: rows.length,
            executionTimeMs: Date.now() - start,
          });
      });
    });
  }

  async getTables(): Promise<string[]> {
    const res = await this.query("SELECT name FROM sqlite_master WHERE type='table'");
    return res.rows.map((r) => r.name);
  }
}
