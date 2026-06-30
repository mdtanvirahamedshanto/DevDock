import { spawn, ChildProcess } from 'child_process';
import { eventBus } from '@devdock/core';

export interface ExecutionOptions {
  timeoutMs?: number;
  cwd?: string;
  env?: Record<string, string>;
  abortSignal?: AbortSignal;
}

export class CommandExecutorService {
  private allowedBinaries = new Set(['docker', 'git', 'netstat', 'lsof']);

  /**
   * Short-running command execution
   */
  public async execute(binary: string, args: string[], options: ExecutionOptions = {}): Promise<string> {
    this.validateBinary(binary);
    const timeoutMs = options.timeoutMs || 5000;

    return new Promise((resolve, reject) => {
      const child = spawn(binary, args, { shell: false, cwd: options.cwd, env: { ...process.env, ...options.env } });
      let stdout = '';
      let stderr = '';

      const timer = setTimeout(() => {
        child.kill();
        reject(new Error(`Command timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      options.abortSignal?.addEventListener('abort', () => {
        child.kill();
        clearTimeout(timer);
        reject(new Error('Command aborted'));
      });

      child.stdout.on('data', (data) => stdout += data.toString());
      child.stderr.on('data', (data) => stderr += data.toString());

      child.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0) reject(new Error(`Command failed with code ${code}: ${stderr}`));
        else resolve(stdout);
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  /**
   * Long-running command execution with streaming events
   */
  public executeStreaming(
    binary: string, 
    args: string[], 
    streamId: string, 
    options: ExecutionOptions = {}
  ): ChildProcess {
    this.validateBinary(binary);
    
    const child = spawn(binary, args, { shell: false, cwd: options.cwd, env: { ...process.env, ...options.env } });

    options.abortSignal?.addEventListener('abort', () => {
      child.kill();
    });

    eventBus.emit(`${streamId}.started`);

    child.stdout.on('data', (data) => eventBus.emit(`${streamId}.stdout`, data.toString()));
    child.stderr.on('data', (data) => eventBus.emit(`${streamId}.stderr`, data.toString()));
    child.on('close', (code) => eventBus.emit(`${streamId}.completed`, code));
    child.on('error', (err) => eventBus.emit(`${streamId}.failed`, err.message));

    return child;
  }

  private validateBinary(binary: string) {
    if (!this.allowedBinaries.has(binary)) {
      throw new Error(`Execution of binary '${binary}' is not allowed for security reasons.`);
    }
  }
}
