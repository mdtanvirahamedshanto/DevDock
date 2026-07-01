import { IDatabaseDriver, DbConnectionConfig, DbQueryResult } from './types';
import { PostgresDriver } from './drivers/postgres';
import { MysqlDriver } from './drivers/mysql';
import { SqliteDriver } from './drivers/sqlite';
import { MongodbDriver } from './drivers/mongodb';
import { RedisDriver } from './drivers/redis';

export class DatabaseManager {
  private connections: Map<string, IDatabaseDriver> = new Map();

  async connect(config: DbConnectionConfig): Promise<void> {
    if (this.connections.has(config.id)) {
      throw new Error(`Connection ${config.id} already exists`);
    }

    let driver: IDatabaseDriver;
    switch (config.engine) {
      case 'postgres':
        driver = new PostgresDriver();
        break;
      case 'mysql':
      case 'mariadb':
        driver = new MysqlDriver();
        break;
      case 'sqlite':
        driver = new SqliteDriver();
        break;
      case 'mongodb':
        driver = new MongodbDriver();
        break;
      case 'redis':
        driver = new RedisDriver();
        break;
      default:
        throw new Error(`Unsupported engine: ${config.engine}`);
    }

    await driver.connect(config);
    this.connections.set(config.id, driver);
  }

  async disconnect(id: string): Promise<void> {
    const driver = this.connections.get(id);
    if (driver) {
      await driver.disconnect();
      this.connections.delete(id);
    }
  }

  async query(id: string, sql: string): Promise<DbQueryResult> {
    const driver = this.connections.get(id);
    if (!driver) {
      throw new Error(`Connection ${id} not found`);
    }
    return driver.query(sql);
  }

  async getTables(id: string): Promise<string[]> {
    const driver = this.connections.get(id);
    if (!driver) {
      throw new Error(`Connection ${id} not found`);
    }
    return driver.getTables();
  }
}

export const dbManager = new DatabaseManager();
