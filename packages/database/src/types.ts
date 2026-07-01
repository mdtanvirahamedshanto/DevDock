export type DatabaseEngine = 'postgres' | 'mysql' | 'sqlite' | 'mongodb' | 'redis' | 'mariadb';

export interface DbConnectionConfig {
  id: string;
  name: string;
  engine: DatabaseEngine;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  connectionString?: string;
}

export interface DbQueryResult {
  rows: any[];
  fields: string[];
  rowCount: number;
  executionTimeMs: number;
}

export interface IDatabaseDriver {
  connect(config: DbConnectionConfig): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string): Promise<DbQueryResult>;
  getTables(): Promise<string[]>;
}
