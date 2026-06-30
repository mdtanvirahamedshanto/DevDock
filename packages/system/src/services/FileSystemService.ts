import { promises as fs } from 'fs';
import path from 'path';

export class FileSystemService {
  public async readFile(filePath: string): Promise<string> {
    this.validatePath(filePath);
    return await fs.readFile(filePath, 'utf-8');
  }

  public async writeFile(filePath: string, data: string): Promise<void> {
    this.validatePath(filePath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data, 'utf-8');
  }

  public async deleteFile(filePath: string): Promise<void> {
    this.validatePath(filePath);
    await fs.unlink(filePath);
  }

  public async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private validatePath(targetPath: string): void {
    // Prevent directory traversal
    if (targetPath.includes('..')) {
      throw new Error('Path traversal detected. Operation denied.');
    }
  }
}
