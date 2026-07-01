import si from 'systeminformation';
import { processService } from '@devdock/processes';

export interface PortData {
  port: number;
  protocol: string;
  state: string;
  pid: number;
  processName: string;
  framework: string;
  isReserved: boolean;
}

const RESERVED_PORTS = new Set([80, 443, 3306, 5432, 27017, 6379]);

const guessFramework = (processName: string): string => {
  const name = processName.toLowerCase();
  if (name.includes('node') || name.includes('bun') || name.includes('deno')) return 'Node/JS/TS';
  if (name.includes('python')) return 'Python';
  if (name.includes('java')) return 'Java';
  if (name.includes('php')) return 'PHP';
  if (name.includes('go') || name.includes('main')) return 'Go';
  if (name.includes('dotnet')) return '.NET';
  if (name.includes('docker') || name.includes('com.docker')) return 'Docker';
  if (name.includes('mysql') || name.includes('postgres') || name.includes('redis'))
    return 'Database';
  return 'Native';
};

export class PortService {
  public async getActivePorts(): Promise<PortData[]> {
    try {
      const [connections, processes] = await Promise.all([
        si.networkConnections(),
        processService.getProcesses(),
      ]);

      const processMap = new Map(processes.map((p) => [p.pid, p.name]));
      const activePorts: PortData[] = [];

      for (const conn of connections) {
        if (conn.state === 'LISTEN' && conn.localPort && conn.pid) {
          const processName = processMap.get(conn.pid) || 'Unknown';
          const port = parseInt(conn.localPort, 10);

          if (!isNaN(port) && port > 0) {
            activePorts.push({
              port,
              protocol: conn.protocol,
              state: conn.state,
              pid: conn.pid,
              processName,
              framework: guessFramework(processName),
              isReserved: RESERVED_PORTS.has(port),
            });
          }
        }
      }

      // Deduplicate by port (sometimes multiple IP binds return duplicates)
      const uniquePorts = Array.from(new Map(activePorts.map((p) => [p.port, p])).values());
      return uniquePorts.sort((a, b) => a.port - b.port);
    } catch (e) {
      console.error('Failed to get active ports:', e);
      return [];
    }
  }

  public async killPort(pid: number): Promise<boolean> {
    return processService.executeAction(pid, 'kill');
  }

  public async forceKillPort(pid: number): Promise<boolean> {
    return processService.executeAction(pid, 'forceKill');
  }
}

export const portService = new PortService();
