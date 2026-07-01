import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  hash?: string;
}

export class FileScanner {
  async walk(dir: string, fileList: FileInfo[] = []): Promise<FileInfo[]> {
    try {
      const files = await fs.readdir(dir, { withFileTypes: true });
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        // Skip common heavy directories
        if (file.isDirectory() && !['node_modules', '.git', 'dist', '.next'].includes(file.name)) {
          await this.walk(filePath, fileList);
        } else if (file.isFile()) {
          const stat = await fs.stat(filePath);
          fileList.push({ path: filePath, name: file.name, size: stat.size });
        }
      }
      return fileList;
    } catch (e) {
      return fileList;
    }
  }

  async findLargeFiles(dir: string, minSizeMB: number = 10): Promise<FileInfo[]> {
    const allFiles = await this.walk(dir);
    const minBytes = minSizeMB * 1024 * 1024;
    return allFiles.filter((f) => f.size >= minBytes).sort((a, b) => b.size - a.size); // Descending
  }

  async findDuplicates(dir: string): Promise<FileInfo[][]> {
    const allFiles = await this.walk(dir);

    // Group by size first (fast)
    const sizeMap = new Map<number, FileInfo[]>();
    for (const f of allFiles) {
      if (!sizeMap.has(f.size)) sizeMap.set(f.size, []);
      sizeMap.get(f.size)!.push(f);
    }

    const potentialDuplicates = Array.from(sizeMap.values()).filter(
      (group) => group.length > 1 && group[0].size > 0,
    );
    const duplicates: FileInfo[][] = [];

    // Group by MD5 hash (slow, only on same-sized files)
    for (const group of potentialDuplicates) {
      const hashMap = new Map<string, FileInfo[]>();
      for (const f of group) {
        try {
          const buffer = await fs.readFile(f.path);
          const hash = crypto.createHash('md5').update(buffer).digest('hex');
          f.hash = hash;
          if (!hashMap.has(hash)) hashMap.set(hash, []);
          hashMap.get(hash)!.push(f);
        } catch (e) {
          // ignore read errors
        }
      }

      for (const hashGroup of Array.from(hashMap.values())) {
        if (hashGroup.length > 1) duplicates.push(hashGroup);
      }
    }

    return duplicates;
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const fileScanner = new FileScanner();
