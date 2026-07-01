import { spawn } from 'child_process';
import { DbConnectionConfig } from './types';
import fs from 'fs';

export class BackupService {
  async backup(config: DbConnectionConfig, destPath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let cmd = '';
      let args: string[] = [];

      if (config.engine === 'mysql' || config.engine === 'mariadb') {
        cmd = 'mysqldump';
        args = [
          `-h${config.host}`,
          `-P${config.port}`,
          `-u${config.user}`,
          `-p${config.password}`,
          config.database || '',
        ];
      } else if (config.engine === 'postgres') {
        cmd = 'pg_dump';
        args = [
          `-h`,
          config.host || 'localhost',
          `-p`,
          config.port?.toString() || '5432',
          `-U`,
          config.user || 'postgres',
          config.database || '',
        ];
        process.env.PGPASSWORD = config.password;
      } else {
        return reject(new Error(`Backup not supported for engine: ${config.engine}`));
      }

      const backupProcess = spawn(cmd, args);
      const outputStream = fs.createWriteStream(destPath);

      backupProcess.stdout.pipe(outputStream);

      backupProcess.on('exit', (code) => {
        if (code === 0) resolve(true);
        else reject(new Error(`Backup process failed with code ${code}`));
      });

      backupProcess.on('error', (err) => {
        reject(err);
      });
    });
  }

  async restore(config: DbConnectionConfig, srcPath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let cmd = '';
      let args: string[] = [];

      if (config.engine === 'mysql' || config.engine === 'mariadb') {
        cmd = 'mysql';
        args = [
          `-h${config.host}`,
          `-P${config.port}`,
          `-u${config.user}`,
          `-p${config.password}`,
          config.database || '',
        ];
      } else if (config.engine === 'postgres') {
        cmd = 'psql';
        args = [
          `-h`,
          config.host || 'localhost',
          `-p`,
          config.port?.toString() || '5432',
          `-U`,
          config.user || 'postgres',
          config.database || '',
        ];
        process.env.PGPASSWORD = config.password;
      } else {
        return reject(new Error(`Restore not supported for engine: ${config.engine}`));
      }

      const restoreProcess = spawn(cmd, args);
      const inputStream = fs.createReadStream(srcPath);

      inputStream.pipe(restoreProcess.stdin);

      restoreProcess.on('exit', (code) => {
        if (code === 0) resolve(true);
        else reject(new Error(`Restore process failed with code ${code}`));
      });

      restoreProcess.on('error', (err) => {
        reject(err);
      });
    });
  }
}

export const backupService = new BackupService();
