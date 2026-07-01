import mysql from 'mysql2/promise';
import { IDatabaseDriver, DbConnectionConfig, DbQueryResult } from '../types';

export class MysqlDriver implements IDatabaseDriver {
  private connection: mysql.Connection | null = null;

  async connect(config: DbConnectionConfig): Promise<void> {
    if (config.connectionString) {
      this.connection = await mysql.createConnection(config.connectionString);
    } else {
      this.connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  async query(sql: string): Promise<DbQueryResult> {
    if (!this.connection) throw new Error('Not connected');
    const start = performance.now();
    const [rows, fields] = await this.connection.query(sql);
    const executionTimeMs = performance.now() - start;

    let parsedRows: any[] = [];
    if (Array.isArray(rows)) {
      parsedRows = rows;
    } else {
      parsedRows = [rows];
    }

    return {
      rows: parsedRows,
      fields: Array.isArray(fields) ? fields.map((f) => f.name) : [],
      rowCount: parsedRows.length,
      executionTimeMs,
    };
  }

  async getTables(): Promise<string[]> {
    const res = await this.query('SHOW TABLES');
    const tables: string[] = [];
    for (const row of res.rows) {
      const vals = Object.values(row);
      if (vals.length > 0) tables.push(String(vals[0]));
    }
    return tables;
  }
}
