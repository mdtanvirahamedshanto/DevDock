import React from 'react';
import { useMonitoringStore } from '../../store/useMonitoringStore';
import { Card, Badge } from '@devdock/ui';
import { Cpu, MemoryStick, Activity, HardDrive, Monitor } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export const DashboardModule: React.FC = () => {
  const { history } = useMonitoringStore();
  const latest = history[history.length - 1];

  if (!latest) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Gathering telemetry...
      </div>
    );
  }

  const chartData = history.map((h, i) => ({
    time: i,
    cpu: h.cpu.load,
    ram: h.mem.percentage,
    rx: h.network.rx_sec / 1024 / 1024,
    tx: h.network.tx_sec / 1024 / 1024,
  }));

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024,
      sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">High-level system overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU */}
        <Card className="p-4 bg-card/50 border-border/50 shadow-sm flex flex-col h-48">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold flex items-center">
              <Cpu className="w-4 h-4 mr-2 text-blue-500" /> CPU
            </h3>
            <span className="font-mono font-bold">{latest.cpu.load.toFixed(1)}%</span>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpuDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis domain={[0, 100]} hide />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#3b82f6"
                  fill="url(#colorCpuDash)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* RAM */}
        <Card className="p-4 bg-card/50 border-border/50 shadow-sm flex flex-col h-48">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold flex items-center">
              <MemoryStick className="w-4 h-4 mr-2 text-purple-500" /> Memory
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">{formatBytes(latest.mem.used)}</span>
              <span className="font-mono font-bold">{latest.mem.percentage.toFixed(1)}%</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRamDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis domain={[0, 100]} hide />
                <Area
                  type="monotone"
                  dataKey="ram"
                  stroke="#a855f7"
                  fill="url(#colorRamDash)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Network */}
        <Card className="p-4 bg-card/50 border-border/50 shadow-sm flex flex-col h-48">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold flex items-center">
              <Activity className="w-4 h-4 mr-2 text-green-500" /> Network
            </h3>
            <div className="flex space-x-2 text-xs font-mono">
              <span className="text-green-500">
                ↓{' '}
                {latest.network.rx_sec > 1024 * 1024
                  ? (latest.network.rx_sec / 1024 / 1024).toFixed(1) + ' MB/s'
                  : (latest.network.rx_sec / 1024).toFixed(0) + ' KB/s'}
              </span>
              <span className="text-orange-500">
                ↑{' '}
                {latest.network.tx_sec > 1024 * 1024
                  ? (latest.network.tx_sec / 1024 / 1024).toFixed(1) + ' MB/s'
                  : (latest.network.tx_sec / 1024).toFixed(0) + ' KB/s'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNetDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide />
                <Area
                  type="monotone"
                  dataKey="rx"
                  stroke="#22c55e"
                  fill="url(#colorNetDash)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Disk Summary */}
        <Card className="p-4 bg-card/50 border-border/50 shadow-sm flex flex-col h-48">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold flex items-center">
              <HardDrive className="w-4 h-4 mr-2 text-yellow-500" /> Primary Disk
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            {latest.fs
              .filter((f) => f.mount === '/' || f.mount === '/System/Volumes/Data')
              .map((fs, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium truncate max-w-[120px]" title={fs.mount}>
                      {fs.mount}
                    </span>
                    <span className="text-muted-foreground">{fs.use.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${fs.use > 90 ? 'bg-destructive' : 'bg-yellow-500'}`}
                      style={{ width: `${fs.use}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
