import React from 'react';
import { useMonitoringStore } from '../../store/useMonitoringStore';
import { Card, Badge } from '@devdock/ui';
import {
  Bluetooth,
  MonitorSmartphone,
  Mouse,
  Headphones,
  Watch,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const BluetoothModule: React.FC = () => {
  const { history } = useMonitoringStore();
  const latest = history[history.length - 1];

  if (!latest) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Waiting for telemetry...
      </div>
    );
  }

  const { bluetooth } = latest;

  const renderIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('mouse') || t.includes('keyboard') || t.includes('trackpad'))
      return <Mouse className="w-5 h-5" />;
    if (
      t.includes('headset') ||
      t.includes('audio') ||
      t.includes('speaker') ||
      t.includes('airpods')
    )
      return <Headphones className="w-5 h-5" />;
    if (t.includes('phone') || t.includes('iphone'))
      return <MonitorSmartphone className="w-5 h-5" />;
    if (t.includes('watch')) return <Watch className="w-5 h-5" />;
    return <Bluetooth className="w-5 h-5" />;
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bluetooth</h2>
          <p className="text-muted-foreground">Connected Devices & Peripherals</p>
        </div>
      </div>

      <Card className="p-0 bg-card/50 border-border/50 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bluetooth.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center text-muted-foreground">
              <Bluetooth className="w-12 h-12 mb-4 opacity-20" />
              <p>No Bluetooth devices found.</p>
            </div>
          ) : (
            bluetooth.map((device, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-lg transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${device.connected ? 'bg-blue-500/20 text-blue-500' : 'bg-muted text-muted-foreground'}`}
                  >
                    {renderIcon(device.type || device.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{device.name || 'Unknown Device'}</h3>
                    <div className="flex space-x-2 text-xs text-muted-foreground mt-1">
                      <span>{device.type || 'Peripheral'}</span>
                      {device.manufacturer && (
                        <>
                          <span>•</span>
                          <span>{device.manufacturer}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {device.batteryPercent !== null && device.batteryPercent !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {device.batteryPercent}%
                    </Badge>
                  )}
                  {device.connected ? (
                    <span className="flex items-center text-green-500 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Connected
                    </span>
                  ) : (
                    <span className="flex items-center text-muted-foreground text-xs font-medium">
                      <XCircle className="w-4 h-4 mr-1" /> Disconnected
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
