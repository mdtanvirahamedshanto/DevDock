import path from 'path';
import os from 'os';

export class PathService {
  public normalizePath(targetPath: string): string {
    return path.normalize(targetPath);
  }

  public getHomeDir(): string {
    return os.homedir();
  }

  public getTempDir(): string {
    return path.join(os.tmpdir(), 'devdock');
  }

  public getCacheDir(): string {
    // Simple naive approach; in real-world we differentiate by OS
    return path.join(this.getHomeDir(), '.devdock', 'cache');
  }

  public resolvePath(...segments: string[]): string {
    return path.resolve(...segments);
  }
}
