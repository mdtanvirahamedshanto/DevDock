import React, { useMemo } from 'react';
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
} from 'recharts';
import { Wifi, Globe, ArrowDown, ArrowUp } from 'lucide-react';

export const NetworkModule: React.FC = () => {
  const { history, latencyMs, jitterMs } = useMonitoringStore();
  const latest = history[history.length - 1];

  if (!latest) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Waiting for telemetry...
      </div>
    );
  }

  const { network } = latest;

  const formatSpeed = (bps: number) => {
    if (bps > 1024 * 1024) return (bps / 1024 / 1024).toFixed(2) + ' MB/s';
    if (bps > 1024) return (bps / 1024).toFixed(0) + ' KB/s';
    return bps.toFixed(0) + ' B/s';
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024,
      sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const chartData = history.map((h, i) => ({
    time: i,
    download: h.network.rx_sec / 1024,
    upload: h.network.tx_sec / 1024,
  }));

  const latencyChartData = history.map((_, i) => ({
    time: i,
    latency: latencyMs > 0 ? latencyMs : 0,
  }));

  // Connection stability matrix: last 60 ticks as colored dots
  // We use rx_sec > 0 as "connected" proxy
  const stabilityGrid = history.map((h) => h.network.rx_sec + h.network.tx_sec > 0);

  const primaryInterface =
    network.interfaces.find(
      (i) => !i.internal && (i.iface?.startsWith('en') || i.iface?.startsWith('eth')),
    ) ||
    network.interfaces.find((i) => !i.internal) ||
    network.interfaces[0];

  const primaryStats =
    network.stats.find((s) => s.iface === primaryInterface?.iface) || network.stats[0];

  const latencyColor =
    latencyMs < 0
      ? 'text-muted-foreground'
      : latencyMs < 30
        ? 'text-green-500'
        : latencyMs < 80
          ? 'text-yellow-500'
          : 'text-red-500';

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Network</h2>
          <p className="text-muted-foreground">Connectivity, Throughput & Diagnostics</p>
        </div>
      </div>

      {/* Speed Summary + Latency */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-card/50 border-border/50 shadow-sm flex flex-col items-center justify-center">
          <ArrowDown className="w-5 h-5 text-blue-500 mb-1" />
          <div className="text-2xl font-mono font-bold text-blue-500">
            {formatSpeed(network.rx_sec)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Download</div>
        </Card>
        <Card className="p-5 bg-card/50 border-border/50 shadow-sm flex flex-col items-center justify-center">
          <ArrowUp className="w-5 h-5 text-red-500 mb-1" />
          <div className="text-2xl font-mono font-bold text-red-500">
            {formatSpeed(network.tx_sec)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Upload</div>
        </Card>
        <Card className="p-5 bg-card/50 border-border/50 shadow-sm flex flex-col items-center justify-center">
          <div className={`text-2xl font-mono font-bold ${latencyColor}`}>
            {latencyMs < 0 ? '—' : `${latencyMs}ms`}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Latency (1.1.1.1)</div>
          {jitterMs > 0 && (
            <div className="text-[10px] text-muted-foreground">Jitter: {jitterMs}ms</div>
          )}
        </Card>
        <Card className="p-5 bg-card/50 border-border/50 shadow-sm flex flex-col items-center justify-center">
          <div className="text-lg font-mono font-bold">↓{formatBytes(network.sessionRxBytes)}</div>
          <div className="text-lg font-mono font-bold">↑{formatBytes(network.sessionTxBytes)}</div>
          <div className="text-xs text-muted-foreground mt-1">Session Totals</div>
        </Card>
      </div>

      {/* Throughput History */}
      <Card className="p-6 bg-card/50 border-border/50 shadow-sm flex flex-col h-56">
        <h3 className="font-semibold mb-4 text-sm text-muted-foreground shrink-0">
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
                formatter={(v: number) => [`${v.toFixed(0)} KB/s`]}
              />
              <Line
                type="monotone"
                dataKey="download"
                name="↓ Download"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="upload"
                name="↑ Upload"
                stroke="#ef4444"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Stability Matrix */}
        <Card className="p-6 bg-card/50 border-border/50 shadow-sm">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Connection Stability</h3>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 60 }, (_, i) => {
              const connected = stabilityGrid[i] ?? false;
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm ${connected ? 'bg-green-500/80' : i < history.length ? 'bg-red-500/80' : 'bg-muted/30'}`}
                  title={`Tick ${i}: ${connected ? 'Active' : 'No traffic'}`}
                />
              );
            })}
          </div>
          <div className="flex space-x-4 mt-3 text-xs text-muted-foreground">
            <span>
              <span className="text-green-500">■</span> Active
            </span>
            <span>
              <span className="text-red-500">■</span> No traffic
            </span>
            <span>
              <span className="text-muted-foreground">■</span> No data yet
            </span>
          </div>
        </Card>

        {/* Wi-Fi / Interface Details */}
        <Card className="p-6 bg-card/50 border-border/50 shadow-sm">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground flex items-center">
            {network.wifi ? (
              <>
                <Wifi className="w-4 h-4 mr-2" /> Wi-Fi Details
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" /> Interface Details
              </>
            )}
          </h3>
          <div className="space-y-2">
            {network.wifi ? (
              <>
                {[
                  ['SSID', network.wifi.ssid],
                  ['Protocol', network.wifi.protocol || 'Unknown'],
                  ['Security', network.wifi.security || 'Unknown'],
                  ['Channel', String(network.wifi.channel || '—')],
                  [
                    'Frequency',
                    network.wifi.frequency
                      ? `${(network.wifi.frequency / 1000).toFixed(1)} GHz`
                      : '—',
                  ],
                  [
                    'Signal',
                    network.wifi.signalLevel != null ? `${network.wifi.signalLevel} dBm` : '—',
                  ],
                  ['Quality', network.wifi.quality != null ? `${network.wifi.quality}%` : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}:</span>
                    <span className="font-mono font-medium">{value}</span>
                  </div>
                ))}
              </>
            ) : (
              primaryInterface && (
                <>
                  {[
                    ['Interface', primaryInterface.iface],
                    ['IPv4', primaryInterface.ip4],
                    ['IPv6', primaryInterface.ip6],
                    ['MAC', primaryInterface.mac],
                    ['Speed', primaryInterface.speed ? `${primaryInterface.speed} Mbps` : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}:</span>
                      <span className="font-mono font-medium truncate max-w-[200px]">{value}</span>
                    </div>
                  ))}
                </>
              )
            )}
          </div>
        </Card>
      </div>

      {/* All Interfaces Stats */}
      {primaryStats && (
        <Card className="p-6 bg-card/50 border-border/50 shadow-sm">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Total Session Data</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Downloaded', value: formatBytes(primaryStats.rx_bytes) },
              { label: 'Total Uploaded', value: formatBytes(primaryStats.tx_bytes) },
              { label: 'Session Downloaded', value: formatBytes(network.sessionRxBytes) },
              { label: 'Session Uploaded', value: formatBytes(network.sessionTxBytes) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="text-center p-3 bg-muted/20 rounded-lg border border-border/50"
              >
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="font-mono font-bold mt-1">{value}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
