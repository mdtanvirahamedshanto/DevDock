import React, { useEffect, useState } from 'react';
import { useMonitoringStore } from '../../store/useMonitoringStore';
import { Card, Badge } from '@devdock/ui';
import {
  Cpu,
  MemoryStick,
  Activity,
  HardDrive,
  Monitor,
  Clock,
  Thermometer,
  Server,
} from 'lucide-react';
import { AreaChart, Area, YAxis, ResponsiveContainer } from 'recharts';

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

function MiniSparkline({
  data,
  color,
  dataKey,
  domain,
}: {
  data: any[];
  color: string;
  dataKey: string;
  domain?: [number, number];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {domain && <YAxis domain={domain} hide />}
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill={`url(#grad-${dataKey})`}
          isAnimationActive={false}
          dot={false}
          strokeWidth={1.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export const DashboardModule: React.FC = () => {
  const { history, staticInfo } = useMonitoringStore();
  const latest = history[history.length - 1];
  const [uptime, setUptime] = useState(0);

  // Live uptime counter
  useEffect(() => {
    if (!staticInfo?.systemUptime) return;
    const bootEpoch = Date.now() - staticInfo.systemUptime * 1000;
    const updateUptime = () => setUptime(Math.floor((Date.now() - bootEpoch) / 1000));
    updateUptime();
    const interval = setInterval(updateUptime, 1000);
    return () => clearInterval(interval);
  }, [staticInfo?.systemUptime]);

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
    diskRx: h.disk?.io?.rx_sec / 1024 / 1024 || 0,
    diskWx: h.disk?.io?.wx_sec / 1024 / 1024 || 0,
  }));

  const primaryDisk = latest.fs.find((f) => f.mount === '/' || f.mount === '/System/Volumes/Data');
  const primaryDisplay = staticInfo?.displays?.[0];

  const pressureColor =
    latest.mem.pressureLevel === 'critical'
      ? 'text-red-500'
      : latest.mem.pressureLevel === 'warning'
        ? 'text-yellow-500'
        : 'text-green-500';

  return (
    <div className="flex flex-col space-y-5">
      {/* System Profile Header */}
      {staticInfo && (
        <Card className="p-5 bg-gradient-to-r from-primary/10 via-card to-card border-primary/20 shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Server className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{staticInfo.model || 'Unknown Device'}</h3>
                <p className="text-sm text-muted-foreground">{staticInfo.osVersion}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {staticInfo.serial && staticInfo.serial !== 'Unknown' && (
                    <Badge variant="outline" className="text-[10px] font-mono">
                      S/N: {staticInfo.serial}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    {staticInfo.platform}
                  </Badge>
                </div>
              </div>
            </div>
            {/* Quick-glance specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center px-3 py-2 bg-muted/40 rounded-lg border border-border/50">
                <div className="text-xs text-muted-foreground">RAM</div>
                <div className="font-semibold font-mono text-sm">
                  {formatBytes(staticInfo.totalRam)}
                </div>
              </div>
              <div className="text-center px-3 py-2 bg-muted/40 rounded-lg border border-border/50">
                <div className="text-xs text-muted-foreground">Storage</div>
                <div className="font-semibold font-mono text-sm">
                  {formatBytes(staticInfo.totalStorage)}
                </div>
              </div>
              {primaryDisplay && (
                <div className="text-center px-3 py-2 bg-muted/40 rounded-lg border border-border/50">
                  <div className="text-xs text-muted-foreground">Display</div>
                  <div className="font-semibold font-mono text-sm">
                    {primaryDisplay.resolutionX}×{primaryDisplay.resolutionY}
                  </div>
                  {primaryDisplay.currentRefreshRate > 0 && (
                    <div className="text-[10px] text-muted-foreground">
                      {primaryDisplay.currentRefreshRate}Hz
                    </div>
                  )}
                </div>
              )}
              <div className="text-center px-3 py-2 bg-muted/40 rounded-lg border border-border/50">
                <div className="text-xs text-muted-foreground flex items-center justify-center">
                  <Clock className="w-3 h-3 mr-1" /> Uptime
                </div>
                <div className="font-semibold font-mono text-sm">{formatUptime(uptime)}</div>
              </div>
            </div>
          </div>
          {/* GPU Info */}
          {staticInfo.gpuControllers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/30 flex flex-wrap gap-3">
              {staticInfo.gpuControllers.map((gpu, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 text-sm text-muted-foreground"
                >
                  <Monitor className="w-3 h-3" />
                  <span>{gpu.model}</span>
                  {gpu.vram > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {formatBytes(gpu.vram * 1024 * 1024)} VRAM
                    </Badge>
                  )}
                  {gpu.cores && (
                    <Badge variant="secondary" className="text-[10px]">
                      {gpu.cores} GPU Cores
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* CPU */}
        <Card className="p-4 bg-card/50 border-border/50 shadow-sm flex flex-col h-44">
          <div className="flex justify-between items-center mb-2 shrink-0">
            <h3 className="font-semibold text-sm flex items-center">
              <Cpu className="w-4 h-4 mr-2 text-blue-500" /> CPU
            </h3>
            <span className="font-mono font-bold text-blue-500">{latest.cpu.load.toFixed(1)}%</span>
          </div>
          <div className="flex-1 min-h-0">
            <MiniSparkline data={chartData} color="#3b82f6" dataKey="cpu" domain={[0, 100]} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1 shrink-0">
            <span>1m: {latest.cpu.loadAvg1m?.toFixed(2) ?? '--'}</span>
            <span>5m: {latest.cpu.loadAvg5m?.toFixed(2) ?? '--'}</span>
            <span>15m: {latest.cpu.loadAvg15m?.toFixed(2) ?? '--'}</span>
          </div>
        </Card>

        {/* RAM */}
        <Card className="p-4 bg-card/50 border-border/50 shadow-sm flex flex-col h-44">
          <div className="flex justify-between items-center mb-2 shrink-0">
            <h3 className="font-semibold text-sm flex items-center">
              <MemoryStick className="w-4 h-4 mr-2 text-purple-500" /> Memory
            </h3>
            <span className={`font-mono font-bold ${pressureColor}`}>
              {latest.mem.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <MiniSparkline data={chartData} color="#a855f7" dataKey="ram" domain={[0, 100]} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 shrink-0">
            <span>Pressure: </span>
            <span className={pressureColor}>{latest.mem.pressureLevel}</span>
            <span>
              {' '}
              · {formatBytes(latest.mem.used)} / {formatBytes(latest.mem.total)}
            </span>
          </div>
        </Card>

        {/* Network */}
        <Card className="p-4 bg-card/50 border-border/50 shadow-sm flex flex-col h-44">
          <div className="flex justify-between items-center mb-2 shrink-0">
            <h3 className="font-semibold text-sm flex items-center">
              <Activity className="w-4 h-4 mr-2 text-green-500" /> Network
            </h3>
            <div className="text-[10px] font-mono space-x-1">
              <span className="text-green-500">
                ↓
                {latest.network.rx_sec > 1024 * 1024
                  ? (latest.network.rx_sec / 1024 / 1024).toFixed(1) + 'MB/s'
                  : (latest.network.rx_sec / 1024).toFixed(0) + 'KB/s'}
              </span>
              <span className="text-orange-500">
                ↑
                {latest.network.tx_sec > 1024 * 1024
                  ? (latest.network.tx_sec / 1024 / 1024).toFixed(1) + 'MB/s'
                  : (latest.network.tx_sec / 1024).toFixed(0) + 'KB/s'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <MiniSparkline data={chartData} color="#22c55e" dataKey="rx" />
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 shrink-0">
            {latest.network.wifi?.ssid ? `Wi-Fi: ${latest.network.wifi.ssid}` : 'Wired/Unknown'}
          </div>
        </Card>

        {/* Disk I/O */}
        <Card className="p-4 bg-card/50 border-border/50 shadow-sm flex flex-col h-44">
          <div className="flex justify-between items-center mb-2 shrink-0">
            <h3 className="font-semibold text-sm flex items-center">
              <HardDrive className="w-4 h-4 mr-2 text-yellow-500" /> Disk I/O
            </h3>
            <div className="text-[10px] font-mono space-x-1">
              <span className="text-yellow-500">
                R:{formatBytes(latest.disk?.io?.rx_sec || 0)}/s
              </span>
              <span className="text-orange-400">
                W:{formatBytes(latest.disk?.io?.wx_sec || 0)}/s
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <MiniSparkline data={chartData} color="#eab308" dataKey="diskRx" />
          </div>
          {primaryDisk && (
            <div className="text-[10px] text-muted-foreground mt-1 shrink-0">
              {primaryDisk.mount}: {primaryDisk.use.toFixed(1)}% used of{' '}
              {formatBytes(primaryDisk.size)}
            </div>
          )}
        </Card>

        {/* Temperature */}
        <Card className="p-4 bg-card/50 border-border/50 shadow-sm flex flex-col h-44 justify-between">
          <div className="flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-sm flex items-center">
              <Thermometer className="w-4 h-4 mr-2 text-red-500" /> Thermal
            </h3>
            <span
              className={`font-mono font-bold ${latest.hardware.temp > 80 ? 'text-red-500' : latest.hardware.temp > 65 ? 'text-yellow-500' : 'text-green-500'}`}
            >
              {latest.hardware.temp > 0 ? `${latest.hardware.temp}°C` : 'N/A'}
            </span>
          </div>
          <div className="space-y-2">
            {latest.hardware.sensors.slice(0, 3).map((s, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground truncate max-w-[120px]">{s.label}</span>
                <span
                  className={`font-mono ${s.temp > 80 ? 'text-red-500' : s.temp > 65 ? 'text-yellow-500' : 'text-foreground'}`}
                >
                  {s.temp}°C
                </span>
              </div>
            ))}
            {latest.hardware.sensors.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-2">
                No sensors accessible
              </div>
            )}
          </div>
        </Card>

        {/* Battery */}
        <Card className="p-4 bg-card/50 border-border/50 shadow-sm flex flex-col h-44 justify-center items-center">
          {latest.battery.hasBattery ? (
            <>
              <div className="text-4xl font-bold font-mono mb-1">{latest.battery.percent}%</div>
              <div className="text-sm text-muted-foreground">
                {latest.battery.isCharging ? '⚡ Charging' : '🔋 On Battery'}
              </div>
              {!latest.battery.isCharging && latest.battery.timeRemaining > 0 && (
                <div className="text-xs mt-2 text-muted-foreground">
                  {Math.floor(latest.battery.timeRemaining / 60)}h{' '}
                  {latest.battery.timeRemaining % 60}m remaining
                </div>
              )}
              <div className="w-full bg-muted/30 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${latest.battery.percent > 20 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${latest.battery.percent}%` }}
                />
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground text-center">
              <Monitor className="w-8 h-8 mb-2 mx-auto opacity-20" />
              No battery (Desktop)
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
