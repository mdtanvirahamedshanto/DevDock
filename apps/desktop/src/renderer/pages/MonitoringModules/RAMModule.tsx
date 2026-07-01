import React from 'react';
import { useMonitoringStore } from '../../store/useMonitoringStore';
import { Card } from '@devdock/ui';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const RAMModule: React.FC = () => {
  const { history } = useMonitoringStore();
  const latest = history[history.length - 1];

  if (!latest) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Waiting for telemetry...
      </div>
    );
  }

  const { mem } = latest;

  const chartData = history.map((h, i) => ({
    time: i,
    used: h.mem.used / 1024 / 1024 / 1024,
    free: h.mem.free / 1024 / 1024 / 1024,
  }));

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024,
      sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pressure = (mem.used / mem.total) * 100;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Memory (RAM)</h2>
          <p className="text-muted-foreground">Unified Memory Architecture</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-purple-500">{mem.percentage.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">{formatBytes(mem.total)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ring Chart & Breakdown */}
        <Card className="col-span-1 p-6 flex flex-col justify-center items-center bg-card/50 border-border/50 shadow-sm relative">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Simple SVG Ring Chart */}
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                className="text-muted/30"
                strokeWidth="12"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                className="text-purple-500"
                strokeWidth="12"
                strokeDasharray={`${(mem.percentage / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{mem.percentage.toFixed(0)}%</span>
            </div>
          </div>

          <div className="mt-6 w-full space-y-2 text-sm font-medium">
            <div className="flex justify-between items-center">
              <span className="flex items-center text-muted-foreground">Used:</span>
              <span>{formatBytes(mem.used)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center text-muted-foreground">Free:</span>
              <span>{formatBytes(mem.free)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center text-muted-foreground">Swap:</span>
              <span>{formatBytes(mem.swapUsed)}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
              <span className="flex items-center text-muted-foreground">Memory Pressure:</span>
              <span
                className={`${pressure > 80 ? 'text-red-500' : pressure > 60 ? 'text-yellow-500' : 'text-green-500'}`}
              >
                {pressure > 80 ? 'Critical' : pressure > 60 ? 'Warning' : 'Normal'}
              </span>
            </div>
          </div>
        </Card>

        {/* History Graph */}
        <Card className="col-span-1 md:col-span-2 p-6 bg-card/50 border-border/50 shadow-sm flex flex-col">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground">
            Memory Pressure History
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis dataKey="time" hide />
                <YAxis
                  domain={[0, mem.total / 1024 / 1024 / 1024]}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                  formatter={(value: number) => [value.toFixed(2) + ' GB', 'Used']}
                />
                <Area
                  type="monotone"
                  dataKey="used"
                  stroke="#a855f7"
                  fill="url(#colorRam)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
