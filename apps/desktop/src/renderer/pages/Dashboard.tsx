import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@devdock/ui';
import { useSystemStore } from '../store/useSystemStore';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Battery,
  Fan,
  Thermometer,
  Monitor,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { metrics, history, startListening } = useSystemStore();

  useEffect(() => {
    startListening();
  }, [startListening]);

  const cpuData = useMemo(
    () => history.map((m, i) => ({ time: i, load: m.cpu.currentLoad })),
    [history],
  );
  const ramData = useMemo(
    () => history.map((m, i) => ({ time: i, used: (m.mem.used / 1024 / 1024 / 1024).toFixed(2) })),
    [history],
  );

  if (!metrics) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Initializing Native Telemetry...</p>
        </div>
      </div>
    );
  }

  const mainDrive = metrics.storage[0] || { total: 0, used: 0, free: 0 };
  const mainNet = metrics.network[0] || { rx_sec: 0, tx_sec: 0 };
  const mainGpu = metrics.gpu.controllers[0] || { vendor: 'N/A', model: 'Unknown', vram: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            System Telemetry
          </h2>
          <p className="text-muted-foreground mt-1">
            {metrics.os.distro} {metrics.os.release} ({metrics.os.arch})
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* CPU Widget */}
        <Card className="col-span-2 overflow-hidden relative group border-primary/20 bg-gradient-to-b from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 text-primary">
              <Cpu className="w-4 h-4" />
              <span>
                {metrics.cpu.brand} ({metrics.cpu.cores} Cores)
              </span>
            </CardTitle>
            <span className="text-2xl font-bold">{metrics.cpu.currentLoad.toFixed(1)}%</span>
          </CardHeader>
          <CardContent className="p-0 h-32 mt-4 relative z-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="load"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#cpuGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* RAM Widget */}
        <Card className="col-span-2 overflow-hidden relative group border-primary/20 bg-gradient-to-b from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 text-primary">
              <MemoryStick className="w-4 h-4" />
              <span>Memory ({(metrics.mem.total / 1024 / 1024 / 1024).toFixed(1)} GB Total)</span>
            </CardTitle>
            <span className="text-2xl font-bold">
              {((metrics.mem.used / metrics.mem.total) * 100).toFixed(1)}%
            </span>
          </CardHeader>
          <CardContent className="p-0 h-32 mt-4 relative z-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ramData}>
                <defs>
                  <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="used"
                  stroke="hsl(var(--chart-2))"
                  fillOpacity={1}
                  fill="url(#ramGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Storage Widget */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 text-muted-foreground">
              <HardDrive className="w-4 h-4" />
              <span>Main SSD</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((mainDrive.used / mainDrive.total) * 100 || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(mainDrive.free / 1024 / 1024 / 1024).toFixed(1)} GB free
            </p>
          </CardContent>
        </Card>

        {/* Network Widget */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 text-muted-foreground">
              <Wifi className="w-4 h-4" />
              <span>Network Tx/Rx</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(mainNet.rx_sec / 1024).toFixed(1)} KB/s</div>
            <p className="text-xs text-muted-foreground mt-1">
              Up: {(mainNet.tx_sec / 1024).toFixed(1)} KB/s
            </p>
          </CardContent>
        </Card>

        {/* GPU Widget */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 text-muted-foreground">
              <Monitor className="w-4 h-4" />
              <span>GPU Engine</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{mainGpu.vendor}</div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{mainGpu.model}</p>
          </CardContent>
        </Card>

        {/* Temp/Battery Widget */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 text-muted-foreground">
              {metrics.battery.hasBattery ? (
                <Battery className="w-4 h-4" />
              ) : (
                <Thermometer className="w-4 h-4" />
              )}
              <span>{metrics.battery.hasBattery ? 'Battery' : 'Core Temp'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.battery.hasBattery
                ? `${metrics.battery.percent}%`
                : `${metrics.cpu.temperature > 0 ? metrics.cpu.temperature + '°C' : 'N/A'}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.battery.hasBattery && metrics.battery.isCharging ? 'Charging' : 'Optimal'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
