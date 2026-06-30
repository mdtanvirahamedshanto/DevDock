import { spawn } from 'child_process';

export class CommandExecutorService {
  private allowedBinaries = new Set(['docker', 'git', 'netstat', 'lsof']);

  public async execute(binary: string, args: string[], timeoutMs: number = 5000): Promise<string> {
    if (!this.allowedBinaries.has(binary)) {
      throw new Error(`Execution of binary '${binary}' is not allowed for security reasons.`);
    }

    return new Promise((resolve, reject) => {
      const child = spawn(binary, args, { shell: false }); // STRICTLY shell: false
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timer = setTimeout(() => {
        child.kill();
        reject(new Error(`Command timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      child.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0) {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        } else {
          resolve(stdout);
        }
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }
}
