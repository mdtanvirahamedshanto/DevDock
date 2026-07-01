import React from 'react';
import { useMonitoringStore } from '../../store/useMonitoringStore';
import { Card, Badge } from '@devdock/ui';
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
  const total = mem.total;

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024,
      sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pct = (val: number) => (total > 0 ? (val / total) * 100 : 0);

  const pressureAngle = (mem.percentage / 100) * 180;
  const pressureColor =
    mem.pressureLevel === 'critical'
      ? '#ef4444'
      : mem.pressureLevel === 'warning'
        ? '#eab308'
        : '#22c55e';

  const chartData = history.map((h, i) => ({
    time: i,
    used: h.mem.percentage,
    swap: h.mem.swapTotal > 0 ? (h.mem.swapUsed / h.mem.swapTotal) * 100 : 0,
  }));

  // Stacked bar segments
  const segments = [
    { label: 'Wired', value: mem.wired, color: '#f97316', bg: 'bg-orange-500' },
    { label: 'Compressed', value: mem.compressed, color: '#a855f7', bg: 'bg-purple-500' },
    {
      label: 'App Memory',
      value: mem.used - mem.wired - mem.compressed,
      color: '#3b82f6',
      bg: 'bg-blue-500',
    },
    { label: 'Free', value: mem.free, color: '#6b7280', bg: 'bg-muted-foreground' },
  ].filter((s) => s.value > 0);

  // Pressure gauge SVG path helper
  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle - 90));
    const y1 = cy + r * Math.sin(toRad(startAngle - 90));
    const x2 = cx + r * Math.cos(toRad(endAngle - 90));
    const y2 = cy + r * Math.sin(toRad(endAngle - 90));
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Memory</h2>
          <p className="text-muted-foreground">RAM &amp; Swap Diagnostics</p>
        </div>
        <Badge
          variant={mem.pressureLevel === 'critical' ? 'destructive' : 'secondary'}
          className="text-sm px-3 py-1"
        >
          Pressure: {mem.pressureLevel.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pressure Gauge */}
        <Card className="col-span-1 p-6 bg-card/50 border-border/50 shadow-sm flex flex-col items-center justify-center">
          <h3 className="font-semibold text-sm text-muted-foreground mb-4">Memory Pressure</h3>
          <div className="relative w-44 h-28">
            <svg viewBox="0 0 120 70" className="w-full h-full">
              {/* Background arc */}
              <path
                d={describeArc(60, 60, 45, -90, 90)}
                stroke="hsl(var(--muted))"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              {/* Green zone */}
              <path
                d={describeArc(60, 60, 45, -90, -90 + 60)}
                stroke="#22c55e"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              {/* Yellow zone */}
              <path
                d={describeArc(60, 60, 45, -30, 30)}
                stroke="#eab308"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              {/* Red zone */}
              <path
                d={describeArc(60, 60, 45, 30, 90)}
                stroke="#ef4444"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              {/* Needle */}
              <line
                x1="60"
                y1="60"
                x2={60 + 35 * Math.cos(((pressureAngle - 90) * Math.PI) / 180)}
                y2={60 + 35 * Math.sin(((pressureAngle - 90) * Math.PI) / 180)}
                stroke={pressureColor}
                strokeWidth="2"
                strokeLinecap="round"
                style={{ transition: 'all 0.5s ease' }}
              />
              <circle cx="60" cy="60" r="3" fill={pressureColor} />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-0">
              <div className="text-center mb-1">
                <div className="text-2xl font-bold font-mono" style={{ color: pressureColor }}>
                  {mem.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {formatBytes(mem.used)} / {formatBytes(total)}
          </div>
        </Card>

        {/* Memory Usage Graph */}
        <Card className="col-span-1 md:col-span-2 p-6 bg-card/50 border-border/50 shadow-sm flex flex-col h-64">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Usage History</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="swapGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
                />
                <Area
                  type="monotone"
                  dataKey="used"
                  stroke="#a855f7"
                  fill="url(#ramGrad)"
                  isAnimationActive={false}
                  name="RAM %"
                />
                <Area
                  type="monotone"
                  dataKey="swap"
                  stroke="#f97316"
                  fill="url(#swapGrad)"
                  isAnimationActive={false}
                  name="Swap %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Segmented Memory Bar */}
      <Card className="p-6 bg-card/50 border-border/50 shadow-sm">
        <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Memory Distribution</h3>
        <div className="w-full h-6 rounded-full overflow-hidden flex bg-muted/30 border border-border/50">
          {segments.map((s) => (
            <div
              key={s.label}
              className={`h-full ${s.bg} transition-all duration-500`}
              style={{ width: `${pct(s.value)}%` }}
              title={`${s.label}: ${formatBytes(s.value)} (${pct(s.value).toFixed(1)}%)`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center space-x-2 text-sm">
              <span className={`w-3 h-3 rounded-sm ${s.bg}`} />
              <span className="text-muted-foreground">{s.label}:</span>
              <span className="font-mono font-medium">{formatBytes(s.value)}</span>
              <span className="text-muted-foreground text-xs">({pct(s.value).toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Swap Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Swap Total', value: formatBytes(mem.swapTotal) },
          { label: 'Swap Used', value: formatBytes(mem.swapUsed) },
          { label: 'Swap Free', value: formatBytes(mem.swapTotal - mem.swapUsed) },
          {
            label: 'Swap %',
            value:
              mem.swapTotal > 0 ? ((mem.swapUsed / mem.swapTotal) * 100).toFixed(1) + '%' : '0%',
          },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4 bg-card/50 border-border/50 text-center">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="font-mono font-bold text-lg mt-1">{value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};
