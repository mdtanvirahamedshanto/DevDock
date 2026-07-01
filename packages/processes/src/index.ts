import si from 'systeminformation';

export interface ProcessData {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  user: string;
  state: string;
  started: string;
}

export type ProcessAction = 'kill' | 'forceKill' | 'suspend' | 'resume';

export class ProcessService {
  public async getProcesses(): Promise<ProcessData[]> {
    const data = await si.processes();
    return data.list.map((p) => ({
      pid: p.pid,
      name: p.name,
      cpu: p.cpu,
      mem: p.mem,
      user: p.user,
      state: p.state,
      started: p.started,
    }));
  }

  public async executeAction(pid: number, action: ProcessAction): Promise<boolean> {
    try {
      switch (action) {
        case 'kill':
          process.kill(pid, 'SIGTERM');
          break;
        case 'forceKill':
          process.kill(pid, 'SIGKILL');
          break;
        case 'suspend':
          if (process.platform === 'win32') {
            throw new Error('Suspend is not supported natively on Windows via Node.js');
          }
          process.kill(pid, 'SIGSTOP');
          break;
        case 'resume':
          if (process.platform === 'win32') {
            throw new Error('Resume is not supported natively on Windows via Node.js');
          }
          process.kill(pid, 'SIGCONT');
          break;
        default:
          throw new Error('Unknown action');
      }
      return true;
    } catch (e) {
      console.error(`Failed to execute ${action} on PID ${pid}:`, e);
      return false;
    }
  }
}

export const processService = new ProcessService();
