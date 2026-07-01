import React, { useEffect } from 'react';
import { useMonitoringStore } from '../store/useMonitoringStore';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
      <div
        className="h-1 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function formatSpeed(bps: number) {
  if (bps > 1024 * 1024) return (bps / 1024 / 1024).toFixed(1) + 'M';
  if (bps > 1024) return (bps / 1024).toFixed(0) + 'K';
  return bps.toFixed(0) + 'B';
}

export const TrayPopup: React.FC = () => {
  const { history, startMonitoring, stopMonitoring, latencyMs } = useMonitoringStore();
  const latest = history[history.length - 1];

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  const chartData = history.map((h, i) => ({
    time: i,
    cpu: h.cpu.load,
    ram: h.mem.percentage,
  }));

  if (!latest) {
    return (
      <div className="h-screen w-screen bg-[#0d0d0f] flex items-center justify-center text-white/40 text-xs">
        Loading...
      </div>
    );
  }

  const pressureColor =
    latest.mem.pressureLevel === 'critical'
      ? '#ef4444'
      : latest.mem.pressureLevel === 'warning'
        ? '#eab308'
        : '#22c55e';

  return (
    <div className="h-screen w-screen bg-[#0d0d0f]/95 backdrop-blur-xl text-white p-4 flex flex-col space-y-3 overflow-hidden text-xs select-none app-draggable">
      <div className="flex items-center justify-between shrink-0 app-no-drag">
        <span className="font-bold text-sm text-white/90">DevDock</span>
        <span className="text-white/40 text-[10px]">{new Date().toLocaleTimeString()}</span>
      </div>

      {/* CPU */}
      <div className="bg-white/5 rounded-xl p-3 space-y-2 app-no-drag">
        <div className="flex justify-between items-center">
          <span className="text-white/60">CPU</span>
          <span className="font-mono font-bold text-blue-400">{latest.cpu.load.toFixed(1)}%</span>
        </div>
        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="trayCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="cpu"
                stroke="#3b82f6"
                fill="url(#trayCpu)"
                dot={false}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <MiniBar pct={latest.cpu.load} color="#3b82f6" />
        <div className="flex justify-between text-[10px] text-white/30">
          <span>1m: {latest.cpu.loadAvg1m?.toFixed(2) ?? '—'}</span>
          <span>5m: {latest.cpu.loadAvg5m?.toFixed(2) ?? '—'}</span>
        </div>
      </div>

      {/* RAM */}
      <div className="bg-white/5 rounded-xl p-3 space-y-1.5 app-no-drag">
        <div className="flex justify-between items-center">
          <span className="text-white/60">Memory</span>
          <span className="font-mono font-bold" style={{ color: pressureColor }}>
            {latest.mem.percentage.toFixed(1)}%
          </span>
        </div>
        <MiniBar pct={latest.mem.percentage} color={pressureColor} />
        <div className="text-[10px] text-white/30">Pressure: {latest.mem.pressureLevel}</div>
      </div>

      {/* Network */}
      <div className="bg-white/5 rounded-xl p-3 app-no-drag">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-white/60">Network</span>
          <span
            className={`font-mono text-[10px] ${latencyMs < 0 ? 'text-white/30' : latencyMs < 50 ? 'text-green-400' : 'text-yellow-400'}`}
          >
            {latencyMs < 0 ? '—' : `${latencyMs}ms`}
          </span>
        </div>
        <div className="flex justify-between font-mono">
          <span className="text-blue-400">↓ {formatSpeed(latest.network.rx_sec)}/s</span>
          <span className="text-red-400">↑ {formatSpeed(latest.network.tx_sec)}/s</span>
        </div>
      </div>

      {/* Battery (if present) */}
      {latest.battery.hasBattery && (
        <div className="bg-white/5 rounded-xl p-3 app-no-drag">
          <div className="flex justify-between items-center">
            <span className="text-white/60">Battery</span>
            <span className="font-mono font-bold text-green-400">{latest.battery.percent}%</span>
          </div>
          <MiniBar
            pct={latest.battery.percent}
            color={latest.battery.percent > 20 ? '#22c55e' : '#ef4444'}
          />
          <div className="text-[10px] text-white/30 mt-1">
            {latest.battery.isCharging ? '⚡ Charging' : '🔋 Discharging'}
          </div>
        </div>
      )}

      {/* Thermal */}
      <div className="bg-white/5 rounded-xl p-2.5 app-no-drag flex justify-between items-center">
        <span className="text-white/60">Temp</span>
        <span
          className={`font-mono font-bold ${latest.hardware.temp > 80 ? 'text-red-400' : latest.hardware.temp > 65 ? 'text-yellow-400' : 'text-white/80'}`}
        >
          {latest.hardware.temp > 0 ? `${latest.hardware.temp}°C` : 'N/A'}
        </span>
      </div>
    </div>
  );
};
