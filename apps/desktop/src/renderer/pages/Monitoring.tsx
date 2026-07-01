import React, { useEffect } from 'react';
import { useMonitoringStore } from '../store/useMonitoringStore';
import {
  Card,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@devdock/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { Cpu, MemoryStick, Activity, HardDrive } from 'lucide-react';

export const Monitoring: React.FC = () => {
  const { history, disks, startMonitoring, stopMonitoring, fetchHealth } = useMonitoringStore();

  useEffect(() => {
    startMonitoring();
    fetchHealth();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring, fetchHealth]);

  const latest = history[history.length - 1];

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024,
      sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const chartData = history.map((h, i) => ({
    time: i,
    cpu: Math.round(h.cpu.load),
    ram: Math.round(h.mem.percentage),
    rx: h.network.rx_sec / 1024 / 1024, // MB/s
    tx: h.network.tx_sec / 1024 / 1024, // MB/s
  }));

  return (
    <div className="flex flex-col h-full space-y-4 overflow-y-auto pr-2">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Telemetry</h2>
          <p className="text-muted-foreground">Real-time hardware monitoring and diagnostics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU Chart */}
        <Card className="p-4 bg-card border-border flex flex-col h-64">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold flex items-center">
              <Cpu className="w-4 h-4 mr-2" /> CPU Utilization
            </h3>
            {latest && (
              <Badge variant={latest.cpu.load > 80 ? 'destructive' : 'secondary'}>
                {latest.cpu.load.toFixed(1)}%
              </Badge>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorCpu)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* RAM Chart */}
        <Card className="p-4 bg-card border-border flex flex-col h-64">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold flex items-center">
              <MemoryStick className="w-4 h-4 mr-2" /> Memory Pressure
            </h3>
            {latest && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {formatBytes(latest.mem.used)} / {formatBytes(latest.mem.total)}
                </span>
                <Badge variant={latest.mem.percentage > 85 ? 'destructive' : 'secondary'}>
                  {latest.mem.percentage.toFixed(1)}%
                </Badge>
              </div>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Area
                  type="monotone"
                  dataKey="ram"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorRam)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Network Chart */}
        <Card className="p-4 bg-card border-border flex flex-col h-64">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold flex items-center">
              <Activity className="w-4 h-4 mr-2" /> Network (MB/s)
            </h3>
            {latest && (
              <div className="text-xs text-muted-foreground flex space-x-3">
                <span className="text-green-500">
                  ↓ {(latest.network.rx_sec / 1024 / 1024).toFixed(2)} MB/s
                </span>
                <span className="text-orange-500">
                  ↑ {(latest.network.tx_sec / 1024 / 1024).toFixed(2)} MB/s
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }} />
                <Line
                  type="monotone"
                  dataKey="rx"
                  name="Download"
                  stroke="#22c55e"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="tx"
                  name="Upload"
                  stroke="#f97316"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Disk Health Table */}
        <Card className="p-4 bg-card border-border flex flex-col h-64 overflow-hidden">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="font-semibold flex items-center">
              <HardDrive className="w-4 h-4 mr-2" /> Storage & S.M.A.R.T. Health
            </h3>
          </div>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Drive</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                      Scanning disks...
                    </TableCell>
                  </TableRow>
                ) : (
                  disks.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium truncate max-w-[150px]" title={d.name}>
                        {d.name}
                      </TableCell>
                      <TableCell>{d.type}</TableCell>
                      <TableCell>{formatBytes(d.size)}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            d.smartStatus === 'ok'
                              ? 'default'
                              : d.smartStatus === 'Unknown'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {d.smartStatus.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};
