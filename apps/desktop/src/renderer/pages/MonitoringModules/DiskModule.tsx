import React from 'react';
import { useMonitoringStore } from '../../store/useMonitoringStore';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from '@devdock/ui';
import { HardDrive } from 'lucide-react';

export const DiskModule: React.FC = () => {
  const { history, disks } = useMonitoringStore();
  const latest = history[history.length - 1];

  if (!latest) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Waiting for telemetry...
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024,
      sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const primaryDisk = latest.fs.find((f) => f.mount === '/' || f.mount === '/System/Volumes/Data');

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Disk</h2>
          <p className="text-muted-foreground">Storage and S.M.A.R.T. Health</p>
        </div>
      </div>

      {primaryDisk && (
        <Card className="p-6 bg-card/50 border-border/50 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    className="text-muted/30"
                    strokeWidth="16"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    className="text-blue-500"
                    strokeWidth="16"
                    strokeDasharray={`${(primaryDisk.use / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-sm font-bold">{primaryDisk.use.toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{primaryDisk.mount}</h3>
                <p className="text-sm text-muted-foreground">{primaryDisk.type}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Size</div>
              <div className="font-mono text-lg">{formatBytes(primaryDisk.size)}</div>
            </div>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-4 overflow-hidden flex border border-border/50">
            <div className="bg-blue-500 h-full" style={{ width: `${primaryDisk.use}%` }} />
            <div className="bg-transparent h-full flex-1" />
          </div>
          <div className="flex justify-between text-xs mt-2 font-mono">
            <span>
              <span className="text-blue-500 font-bold">■</span> Used:{' '}
              {formatBytes(primaryDisk.used)}
            </span>
            <span>
              <span className="text-muted-foreground font-bold">■</span> Free:{' '}
              {formatBytes(primaryDisk.available)}
            </span>
          </div>
        </Card>
      )}

      {/* Disks Table */}
      <Card className="p-0 bg-card/50 border-border/50 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="p-4 border-b border-border/50 shrink-0 flex justify-between items-center bg-muted/20">
          <h3 className="font-semibold flex items-center">
            <HardDrive className="w-4 h-4 mr-2" /> All Volumes & Health
          </h3>
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card/80 backdrop-blur-md z-10">
              <TableRow>
                <TableHead>Mount / Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latest.fs.map((f, i) => {
                const health = disks.find(
                  (d) => d.device === f.fs || d.name === f.fs || f.fs.includes(d.device),
                );
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[200px]" title={f.mount}>
                        {f.mount}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                        {f.fs}
                      </div>
                    </TableCell>
                    <TableCell>{f.type}</TableCell>
                    <TableCell>{formatBytes(f.used)}</TableCell>
                    <TableCell>{formatBytes(f.available)}</TableCell>
                    <TableCell>{formatBytes(f.size)}</TableCell>
                    <TableCell className="text-right">
                      {health ? (
                        <Badge
                          variant={
                            health.smartStatus === 'ok'
                              ? 'default'
                              : health.smartStatus === 'Unknown'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {health.smartStatus.toUpperCase()}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">UNKNOWN</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
