import React from 'react';
import { useMonitoringStore } from '../../store/useMonitoringStore';
import { Card } from '@devdock/ui';
import { Battery, BatteryCharging, BatteryMedium, BatteryFull } from 'lucide-react';

export const BatteryModule: React.FC = () => {
  const { history } = useMonitoringStore();
  const latest = history[history.length - 1];

  if (!latest) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Waiting for telemetry...
      </div>
    );
  }

  const { battery } = latest;

  if (!battery.hasBattery) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Battery</h2>
        <div className="flex flex-col h-full items-center justify-center text-muted-foreground">
          <Battery className="w-16 h-16 mb-4 opacity-20" />
          <p>No battery detected on this system.</p>
        </div>
      </div>
    );
  }

  const renderBatteryIcon = () => {
    if (battery.isCharging) return <BatteryCharging className="w-12 h-12 text-green-500" />;
    if (battery.percent > 80) return <BatteryFull className="w-12 h-12 text-green-500" />;
    if (battery.percent > 20) return <BatteryMedium className="w-12 h-12 text-yellow-500" />;
    return <Battery className="w-12 h-12 text-red-500" />;
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Battery</h2>
          <p className="text-muted-foreground">Power and Health Metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1 p-6 bg-card/50 border-border/50 shadow-sm flex flex-col items-center justify-center h-72">
          {renderBatteryIcon()}
          <div className="text-5xl font-bold font-mono mt-4">{battery.percent}%</div>
          <div className="text-muted-foreground mt-2">
            {battery.isCharging ? 'Charging' : 'On Battery'}
          </div>

          {!battery.isCharging && battery.timeRemaining > 0 && (
            <div className="text-sm font-medium mt-4 bg-muted/50 px-3 py-1 rounded-full">
              {Math.floor(battery.timeRemaining / 60)}h {battery.timeRemaining % 60}m remaining
            </div>
          )}
        </Card>

        <Card className="col-span-1 p-6 bg-card/50 border-border/50 shadow-sm h-72">
          <h3 className="font-semibold mb-6 text-sm text-muted-foreground">Health Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm p-3 bg-muted/20 rounded-md border border-border/50">
              <span className="text-muted-foreground">Cycle Count</span>
              <span className="font-mono font-medium">{battery.cycleCount}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
