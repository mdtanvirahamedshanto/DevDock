import React from 'react';
import { useMonitoringStore } from '../../store/useMonitoringStore';
import { Card, Badge } from '@devdock/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
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

  const formatBytes = (bytes: number, decimals = 1) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024,
      sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };

  const primaryDisk = latest.fs.find((f) => f.mount === '/' || f.mount === '/System/Volumes/Data');

  const ioChartData = history.map((h, i) => ({
    time: i,
    read: (h.disk?.io?.rx_sec || 0) / 1024 / 1024,
    write: (h.disk?.io?.wx_sec || 0) / 1024 / 1024,
  }));

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Disk</h2>
          <p className="text-muted-foreground">Storage, I/O Throughput & S.M.A.R.T. Health</p>
        </div>
      </div>

      {/* I/O Throughput Chart */}
      <Card className="p-6 bg-card/50 border-border/50 shadow-sm flex flex-col h-64">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="font-semibold text-sm text-muted-foreground">Disk Throughput (MB/s)</h3>
          <div className="flex space-x-4 text-xs font-mono">
            <span className="text-blue-500">R: {formatBytes(latest.disk?.io?.rx_sec || 0)}/s</span>
            <span className="text-orange-500">
              W: {formatBytes(latest.disk?.io?.wx_sec || 0)}/s
            </span>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ioChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis dataKey="time" hide />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(v: number) => [`${v.toFixed(2)} MB/s`]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="read"
                name="Read"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="write"
                name="Write"
                stroke="#f97316"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Primary Disk Capacity */}
      {primaryDisk && (
        <Card className="p-6 bg-card/50 border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-16 h-16">
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
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold">{primaryDisk.use.toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">{primaryDisk.mount}</h3>
                <p className="text-sm text-muted-foreground">{primaryDisk.type}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-bold">{formatBytes(primaryDisk.size)}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden flex border border-border/50">
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${primaryDisk.use}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-2 font-mono">
            <span>
              <span className="text-blue-500">■</span> Used: {formatBytes(primaryDisk.used)}
            </span>
            <span>
              <span className="text-muted-foreground">■</span> Free:{' '}
              {formatBytes(primaryDisk.available)}
            </span>
          </div>
        </Card>
      )}

      {/* S.M.A.R.T. Health Table */}
      <Card className="p-0 bg-card/50 border-border/50 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="p-4 border-b border-border/50 shrink-0 flex justify-between items-center bg-muted/20">
          <h3 className="font-semibold flex items-center">
            <HardDrive className="w-4 h-4 mr-2" /> Volumes &amp; S.M.A.R.T. Telemetry
          </h3>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card/90 backdrop-blur-md z-10 border-b border-border/50">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Mount</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Used</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Size</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Temp</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Power-on Hrs</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Health</th>
              </tr>
            </thead>
            <tbody>
              {latest.fs.map((f, i) => {
                const health = disks.find(
                  (d) => d.device === f.fs || d.name === f.fs || f.fs.includes(d.device),
                );
                return (
                  <tr
                    key={i}
                    className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-3 font-mono text-xs">
                      <div className="truncate max-w-[160px]" title={f.mount}>
                        {f.mount}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                        {f.fs}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{f.type}</td>
                    <td className="p-3 font-mono">{formatBytes(f.used)}</td>
                    <td className="p-3 font-mono">{formatBytes(f.size)}</td>
                    <td className="p-3 font-mono">
                      {health?.temperature != null ? `${health.temperature}°C` : '—'}
                    </td>
                    <td className="p-3 font-mono">
                      {health?.powerOnHours != null ? `${health.powerOnHours}h` : '—'}
                    </td>
                    <td className="p-3 text-right">
                      <Badge
                        variant={
                          health?.smartStatus === 'ok'
                            ? 'default'
                            : health?.smartStatus === 'Unknown'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {health?.smartStatus?.toUpperCase() ?? 'UNKNOWN'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
