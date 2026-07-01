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

  // E/P Core split — use topology data or fall back to half/half heuristic
  const hasTopo = cpu.eCoreCount > 0 || cpu.pCoreCount > 0;
  const pCoreCount = hasTopo ? cpu.pCoreCount : Math.ceil(cpu.cores.length / 2);
  const eCoreCount = hasTopo ? cpu.eCoreCount : Math.floor(cpu.cores.length / 2);
  const pCores = cpu.cores.slice(0, pCoreCount);
  const eCores = cpu.cores.slice(pCoreCount, pCoreCount + eCoreCount);

  const avgSpeedGhz = cpu.avgSpeedMhz ? (cpu.avgSpeedMhz / 1000).toFixed(2) : '—';

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CPU</h2>
          <p className="text-muted-foreground text-sm">{cpu.brand}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{cpu.load.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">
            {cpu.physicalCores}P / {cpu.coresTotal}L cores · {avgSpeedGhz} GHz
          </div>
        </div>
      </div>

      {/* Load Averages */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '1 min', value: cpu.loadAvg1m },
          { label: '5 min', value: cpu.loadAvg5m },
          { label: '15 min', value: cpu.loadAvg15m },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4 bg-card/50 border-border/50 text-center">
            <div className="text-xs text-muted-foreground mb-1">Load Avg ({label})</div>
            <div className="text-2xl font-mono font-bold">{value?.toFixed(2) ?? '—'}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ring Chart & Breakdown */}
        <Card className="col-span-1 p-6 flex flex-col justify-center items-center bg-card/50 border-border/50 shadow-sm">
          <div className="relative w-36 h-36 flex items-center justify-center">
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
              {/* System */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#ef4444"
                strokeWidth="12"
                strokeDasharray={`${(cpu.system / 100) * 251.2} 251.2`}
                strokeLinecap="butt"
              />
              {/* User (offset after system) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="12"
                strokeDasharray={`${(cpu.user / 100) * 251.2} 251.2`}
                strokeDashoffset={`${-((cpu.system / 100) * 251.2)}`}
                strokeLinecap="butt"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{cpu.load.toFixed(0)}%</span>
            </div>
          </div>

          <div className="mt-5 w-full space-y-2 text-sm font-medium">
            {[
              { label: 'System', value: cpu.system, color: 'bg-red-500' },
              { label: 'User', value: cpu.user, color: 'bg-blue-500' },
              { label: 'Idle', value: cpu.idle, color: 'bg-muted-foreground' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className={`w-2 h-2 rounded-full ${color} mr-2`} /> {label}:
                </span>
                <span className="font-mono">{value.toFixed(1)}%</span>
              </div>
            ))}
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

      {/* Per-Core Breakdown — P Cores */}
      {pCores.length > 0 && (
        <Card className="p-6 bg-card/50 border-border/50 shadow-sm">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground">
            Performance Cores ({pCores.length})
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {pCores.map((c, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-end h-28 space-y-2 group"
              >
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
                <span className="text-[10px] font-medium">P{idx}</span>
                {cpu.speeds?.[idx] && (
                  <span className="text-[9px] text-muted-foreground">
                    {(cpu.speeds[idx] * 1000).toFixed(0)}M
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* E Cores */}
      {eCores.length > 0 && (
        <Card className="p-6 bg-card/50 border-border/50 shadow-sm">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground">
            Efficiency Cores ({eCores.length})
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {eCores.map((c, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-end h-28 space-y-2 group"
              >
                <div className="text-xs font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {c.load.toFixed(0)}%
                </div>
                <div className="w-8 h-full bg-muted/30 rounded-full overflow-hidden relative flex flex-col justify-end border border-border/50">
                  <motion.div
                    className="w-full bg-emerald-500 rounded-t-sm"
                    initial={{ height: 0 }}
                    animate={{ height: `${c.user}%` }}
                    transition={{ type: 'tween', duration: 0.5 }}
                  />
                  <motion.div
                    className="w-full bg-yellow-500"
                    initial={{ height: 0 }}
                    animate={{ height: `${c.system}%` }}
                    transition={{ type: 'tween', duration: 0.5 }}
                  />
                </div>
                <span className="text-[10px] font-medium">E{idx}</span>
                {cpu.speeds?.[pCoreCount + idx] && (
                  <span className="text-[9px] text-muted-foreground">
                    {(cpu.speeds[pCoreCount + idx] * 1000).toFixed(0)}M
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
