import * as pty from 'node-pty';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export class TerminalEngine {
  private terminals: Map<string, pty.IPty> = new Map();

  spawn(shell: string, cwd: string, onData: (id: string, data: string) => void): string {
    const id = uuidv4();

    // Determine the default shell if not provided
    let executable = shell;
    if (!executable) {
      executable = os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash';
    }

    const ptyProcess = pty.spawn(executable, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: cwd || process.env.HOME || process.cwd(),
      env: process.env as Record<string, string>,
    });

    ptyProcess.onData((data) => {
      onData(id, data);
    });

    this.terminals.set(id, ptyProcess);
    return id;
  }

  write(id: string, data: string) {
    const term = this.terminals.get(id);
    if (term) term.write(data);
  }

  resize(id: string, cols: number, rows: number) {
    const term = this.terminals.get(id);
    if (term) term.resize(cols, rows);
  }

  kill(id: string) {
    const term = this.terminals.get(id);
    if (term) {
      term.kill();
      this.terminals.delete(id);
    }
  }
}

export const terminalEngine = new TerminalEngine();
