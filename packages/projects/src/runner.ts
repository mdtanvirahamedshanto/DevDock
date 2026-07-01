import { spawn, ChildProcess } from 'child_process';
import path from 'path';

export type LogCallback = (data: string) => void;

class ProjectRunner {
  private activeProcesses: Map<string, ChildProcess> = new Map();

  public async start(
    projectId: string,
    projectPath: string,
    framework: string,
    onLog: LogCallback,
  ): Promise<boolean> {
    if (this.activeProcesses.has(projectId)) {
      return false; // Already running
    }

    let command = 'npm';
    let args = ['run', 'dev'];

    // Basic heuristic to figure out start command
    if (framework === 'Python') {
      command = 'python3';
      args = ['main.py'];
    } else if (framework === 'Go') {
      command = 'go';
      args = ['run', '.'];
    } else if (framework === 'Bun') {
      command = 'bun';
      args = ['run', 'dev'];
    } else if (framework === 'PHP' || framework === 'Laravel') {
      command = 'php';
      args = ['artisan', 'serve'];
    }

    try {
      const child = spawn(command, args, {
        cwd: projectPath,
        shell: true,
        env: process.env, // Inherit system env, user .env is handled separately or read by the app itself
      });

      child.stdout?.on('data', (data) => {
        onLog(`[${projectId}] ${data.toString()}`);
      });

      child.stderr?.on('data', (data) => {
        onLog(`[${projectId}] [ERR] ${data.toString()}`);
      });

      child.on('close', (code) => {
        onLog(`[${projectId}] Process exited with code ${code}`);
        this.activeProcesses.delete(projectId);
      });

      this.activeProcesses.set(projectId, child);
      return true;
    } catch (e: any) {
      onLog(`[${projectId}] Failed to start: ${e.message}`);
      return false;
    }
  }

  public async stop(projectId: string): Promise<boolean> {
    const child = this.activeProcesses.get(projectId);
    if (!child) return false;

    // Use SIGTERM to gracefully shut down, fallback to kill
    child.kill('SIGTERM');
    this.activeProcesses.delete(projectId);
    return true;
  }

  public isRunning(projectId: string): boolean {
    return this.activeProcesses.has(projectId);
  }
}

export const projectRunner = new ProjectRunner();
