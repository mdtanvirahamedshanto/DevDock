import React from 'react';
import { useMonitoringStore } from '../../store/useMonitoringStore';
import { Card } from '@devdock/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity } from 'lucide-react';

export const NetworkModule: React.FC = () => {
  const { history } = useMonitoringStore();
  const latest = history[history.length - 1];

  if (!latest) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Waiting for telemetry...
      </div>
    );
  }

  const { network } = latest;

  const chartData = history.map((h, i) => ({
    time: i,
    download: h.network.rx_sec / 1024,
    upload: h.network.tx_sec / 1024,
  }));

  const formatSpeed = (kbps: number) => {
    if (kbps > 1024) return (kbps / 1024).toFixed(2) + ' MB/s';
    return kbps.toFixed(0) + ' KB/s';
  };

  // Find the primary interface (usually the one with the most traffic or starting with 'en' on mac)
  const primaryInterface =
    network.interfaces.find((i) => !i.internal && i.iface.startsWith('en')) ||
    network.interfaces[0];
  const primaryStats =
    network.stats.find((s) => s.iface === primaryInterface?.iface) || network.stats[0];

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Network</h2>
          <p className="text-muted-foreground">Connectivity and Throughput</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speed Summary */}
        <Card className="col-span-1 md:col-span-2 p-8 bg-card/50 border-border/50 shadow-sm flex flex-col justify-center">
          <div className="flex justify-around items-center">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold">
                {formatSpeed(network.rx_sec / 1024)}
              </div>
              <div className="flex items-center justify-center text-muted-foreground mt-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> Download
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-mono font-bold">
                {formatSpeed(network.tx_sec / 1024)}
              </div>
              <div className="flex items-center justify-center text-muted-foreground mt-2">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> Upload
              </div>
            </div>
          </div>
        </Card>

        {/* Traffic History Graph */}
        <Card className="col-span-1 md:col-span-2 p-6 bg-card/50 border-border/50 shadow-sm flex flex-col h-72">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground">
            Throughput History (KB/s)
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                  itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                />
                <Line
                  type="monotone"
                  dataKey="download"
                  stroke="#3b82f6"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="upload"
                  stroke="#ef4444"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Interface Details */}
        <Card className="col-span-1 md:col-span-2 p-6 bg-card/50 border-border/50 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Details</h3>
              {primaryStats && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                      Total upload:
                    </span>
                    <span className="font-mono font-medium">
                      {(primaryStats.tx_bytes / 1024 / 1024 / 1024).toFixed(2)} GB
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                      Total download:
                    </span>
                    <span className="font-mono font-medium">
                      {(primaryStats.rx_bytes / 1024 / 1024 / 1024).toFixed(2)} GB
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground pl-4">Status:</span>
                    <span className="font-mono text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded">
                      UP
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Interface</h3>
              {primaryInterface && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interface:</span>
                    <span className="font-mono font-medium truncate max-w-[150px]">
                      {primaryInterface.iface}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IPv4:</span>
                    <span className="font-mono font-medium">{primaryInterface.ip4}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IPv6:</span>
                    <span className="font-mono font-medium truncate max-w-[150px]">
                      {primaryInterface.ip6}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MAC Address:</span>
                    <span className="font-mono font-medium">{primaryInterface.mac}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
