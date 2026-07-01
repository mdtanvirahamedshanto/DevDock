import React from 'react';
import { useMonitoringStore } from '../../store/useMonitoringStore';
import { Card, Badge } from '@devdock/ui';
import { Thermometer, Fan, Zap } from 'lucide-react';

export const SensorsModule: React.FC = () => {
  const { history } = useMonitoringStore();
  const latest = history[history.length - 1];

  if (!latest) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Waiting for telemetry...
      </div>
    );
  }

  const { hardware } = latest;

  const getTempColor = (temp: number) => {
    if (temp > 90) return 'text-red-600';
    if (temp > 80) return 'text-red-400';
    if (temp > 70) return 'text-orange-500';
    if (temp > 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getTempBadgeVariant = (temp: number): 'destructive' | 'secondary' | 'default' => {
    if (temp > 80) return 'destructive';
    if (temp > 65) return 'secondary';
    return 'default';
  };

  const getTempBar = (temp: number) => {
    const pct = Math.min((temp / 100) * 100, 100);
    const color = temp > 80 ? 'bg-red-500' : temp > 65 ? 'bg-yellow-500' : 'bg-green-500';
    return { pct, color };
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sensors</h2>
          <p className="text-muted-foreground">Thermal Matrix, Fan Speed & Power</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card/50 border-border/50 shadow-sm flex flex-col items-center justify-center">
          <Thermometer className="w-8 h-8 text-red-500 mb-3" />
          <div className={`text-4xl font-bold font-mono ${getTempColor(hardware.temp)}`}>
            {hardware.temp > 0 ? `${hardware.temp}°C` : 'N/A'}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Package Temp</div>
        </Card>

        <Card className="p-6 bg-card/50 border-border/50 shadow-sm flex flex-col items-center justify-center">
          <Fan className="w-8 h-8 text-blue-500 mb-3" />
          <div className="text-4xl font-bold font-mono">
            {hardware.fanRpm > 0 ? `${Math.round(hardware.fanRpm)} RPM` : '0 RPM'}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Fan Speed</div>
        </Card>

        <Card className="p-6 bg-card/50 border-border/50 shadow-sm flex flex-col items-center justify-center">
          <Zap className="w-8 h-8 text-yellow-500 mb-3" />
          <div className="text-4xl font-bold font-mono text-muted-foreground">—</div>
          <div className="text-sm text-muted-foreground mt-1">Power Draw</div>
          <div className="text-[10px] text-muted-foreground mt-1 text-center">
            Requires elevated permissions
          </div>
        </Card>
      </div>

      {/* Thermal Matrix */}
      <Card className="p-0 bg-card/50 border-border/50 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-border/50 shrink-0 bg-muted/20 flex justify-between items-center">
          <h3 className="font-semibold flex items-center">
            <Thermometer className="w-4 h-4 mr-2" /> Thermal Matrix
          </h3>
          <span className="text-xs text-muted-foreground">{hardware.sensors.length} sensors</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {hardware.sensors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Thermometer className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">No sensor data accessible.</p>
              <p className="text-xs mt-1 text-center max-w-sm">
                Apple Silicon (M-series) restricts SMC sensor access to privileged processes.
                Individual core temperatures require a native daemon.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {hardware.sensors.map((sensor, idx) => {
                const { pct, color } = getTempBar(sensor.temp);
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {sensor.label}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-mono font-bold text-sm ${getTempColor(sensor.temp)}`}
                        >
                          {sensor.temp}°C
                        </span>
                        <Badge
                          variant={getTempBadgeVariant(sensor.temp)}
                          className="text-[10px] px-1"
                        >
                          {sensor.temp > 80 ? 'HOT' : sensor.temp > 65 ? 'WARM' : 'OK'}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Apple Silicon Note */}
      <Card className="p-4 bg-orange-500/5 border-orange-500/20 shadow-sm">
        <div className="flex items-start space-x-3">
          <Thermometer className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold text-orange-500">Apple Silicon Sensor Restriction</span>
            <p className="text-muted-foreground text-xs mt-1">
              Full granular thermal mapping (individual CPU core, GPU matrix, NAND, Wi-Fi card,
              battery cell temperatures) requires an SMC-privileged native daemon. Fan speed
              overrides and manual fan control also require SMC write access via a privileged
              helper.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
