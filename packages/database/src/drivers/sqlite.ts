import { IDatabaseDriver, DbConnectionConfig, DbQueryResult } from '../types';
import Database from 'better-sqlite3';

export class SqliteDriver implements IDatabaseDriver {
  private db: Database.Database | null = null;

  async connect(config: DbConnectionConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.db = new Database(config.database || ':memory:');
        resolve();
      } catch (err) {
        reject(err);
      }
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
      try {
        const stmt = this.db!.prepare(sql);
        let rows: any[] = [];
        let changes = 0;

        // If it's a SELECT statement or similar returning data
        if (stmt.reader) {
          rows = stmt.all();
        } else {
          // If it's an UPDATE/INSERT/DELETE
          const info = stmt.run();
          changes = info.changes;
        }

        resolve({
          rows,
          fields: rows.length > 0 ? Object.keys(rows[0]) : [],
          rowCount: rows.length || changes,
          executionTimeMs: Date.now() - start,
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async execute(sql: string): Promise<void> {
    if (!this.db) throw new Error('Not connected');
    return new Promise((resolve, reject) => {
      try {
        this.db!.exec(sql);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  async getTables(): Promise<string[]> {
    const res = await this.query("SELECT name FROM sqlite_master WHERE type='table'");
    return res.rows.map((r: any) => r.name);
  }
}
