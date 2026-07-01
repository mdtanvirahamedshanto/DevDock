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
import { Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export const CPUModule: React.FC = () => {
  const { history } = useMonitoringStore();
  const latest = history[history.length - 1];

  if (!latest) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Waiting for telemetry...
      </div>
    );
  }

  const { cpu } = latest;

  const chartData = history.map((h, i) => ({
    time: i,
    user: h.cpu.user,
    system: h.cpu.system,
    total: h.cpu.load,
  }));

  // Separate E-cores and P-cores (Heuristics: on Apple Silicon, first 4 are usually E-cores if 8 cores, or similar. We will just list them)
  const eCores = cpu.cores.slice(0, Math.floor(cpu.cores.length / 2));
  const pCores = cpu.cores.slice(Math.floor(cpu.cores.length / 2));

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CPU</h2>
          <p className="text-muted-foreground">{cpu.brand}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{cpu.load.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">{cpu.physicalCores} Cores</div>
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
                className="text-primary"
                strokeWidth="12"
                strokeDasharray={`${(cpu.load / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{cpu.load.toFixed(0)}%</span>
            </div>
          </div>

          <div className="mt-6 w-full space-y-2 text-sm font-medium">
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                System:
              </span>
              <span>{cpu.system.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                User:
              </span>
              <span>{cpu.user.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-muted-foreground mr-2" />
                Idle:
              </span>
              <span>{cpu.idle.toFixed(1)}%</span>
            </div>
          </div>
        </Card>

        {/* History Graph */}
        <Card className="col-span-1 md:col-span-2 p-6 bg-card/50 border-border/50 shadow-sm flex flex-col">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Usage History</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSystem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
                  domain={[0, 100]}
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
                />
                <Area
                  type="monotone"
                  dataKey="system"
                  stackId="1"
                  stroke="#ef4444"
                  fill="url(#colorSystem)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="user"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="url(#colorUser)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Per-Core Breakdown */}
      <Card className="p-6 bg-card/50 border-border/50 shadow-sm flex-1 overflow-y-auto">
        <h3 className="font-semibold mb-6 text-sm text-muted-foreground">
          Logical Cores Utilization
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {cpu.cores.map((c, idx) => (
            <div key={idx} className="flex flex-col items-center justify-end h-32 space-y-2 group">
              <div className="text-xs font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {c.load.toFixed(0)}%
              </div>
              <div className="w-8 h-full bg-muted/30 rounded-full overflow-hidden relative flex flex-col justify-end border border-border/50">
                <motion.div
                  className="w-full bg-blue-500 rounded-t-sm"
                  initial={{ height: 0 }}
                  animate={{ height: `${c.user}%` }}
                  transition={{ type: 'tween', duration: 0.5 }}
                />
                <motion.div
                  className="w-full bg-red-500"
                  initial={{ height: 0 }}
                  animate={{ height: `${c.system}%` }}
                  transition={{ type: 'tween', duration: 0.5 }}
                />
              </div>
              <span className="text-xs font-medium">Core {idx}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
