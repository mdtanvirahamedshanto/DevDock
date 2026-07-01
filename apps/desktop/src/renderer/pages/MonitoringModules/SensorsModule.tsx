import React from 'react';
import { useMonitoringStore } from '../../store/useMonitoringStore';
import { Card } from '@devdock/ui';
import { Thermometer, Fan } from 'lucide-react';

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

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sensors</h2>
          <p className="text-muted-foreground">Thermal and fan telemetry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperatures */}
        <Card className="col-span-1 p-6 bg-card/50 border-border/50 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold flex items-center">
              <Thermometer className="w-4 h-4 mr-2" /> Temperatures
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/20 rounded-md border border-border/50">
              <span className="text-sm font-medium">Main Package</span>
              <span className="font-mono text-lg font-bold">
                {hardware.temp ? hardware.temp + ' °C' : 'N/A'}
              </span>
            </div>

            <div className="mt-4 p-3 bg-muted/30 rounded-md border border-border/50 text-xs text-muted-foreground">
              Note: Apple Silicon securely locks temperature sensors. Full thermal mapping requires
              elevated root privileges and native C++ daemons on M-series chips.
            </div>
          </div>
        </Card>

        {/* Fans */}
        <Card className="col-span-1 p-6 bg-card/50 border-border/50 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold flex items-center">
              <Fan className="w-4 h-4 mr-2" /> Fans
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/20 rounded-md border border-border/50">
              <span className="text-sm font-medium">Fan Speed</span>
              <span className="font-mono text-lg font-bold">
                {hardware.fanRpm ? hardware.fanRpm + ' RPM' : '0 RPM'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
