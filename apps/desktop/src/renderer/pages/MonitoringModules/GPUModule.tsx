import React from 'react';
import { useMonitoringStore } from '../../store/useMonitoringStore';
import { Card } from '@devdock/ui';
import { Monitor } from 'lucide-react';

export const GPUModule: React.FC = () => {
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
  const gpu = hardware.controllers && hardware.controllers[0];

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">GPU</h2>
          <p className="text-muted-foreground">{gpu ? gpu.model || gpu.vendor : 'Unknown GPU'}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-teal-500">{hardware.gpuLoad.toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ring Chart & Breakdown */}
        <Card className="col-span-1 p-6 flex flex-col justify-center items-center bg-card/50 border-border/50 shadow-sm relative h-80">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Simple SVG Ring Chart */}
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                className="text-muted/30"
                strokeWidth="12"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                className="text-teal-500"
                strokeWidth="12"
                strokeDasharray={`${(hardware.gpuLoad / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{hardware.gpuLoad.toFixed(0)}%</span>
            </div>
          </div>

          <div className="mt-6 w-full space-y-2 text-sm font-medium">
            <div className="flex justify-between items-center">
              <span className="flex items-center text-muted-foreground">Usage:</span>
              <span>{hardware.gpuLoad.toFixed(1)}%</span>
            </div>
            {gpu && gpu.vram && (
              <div className="flex justify-between items-center">
                <span className="flex items-center text-muted-foreground">VRAM:</span>
                <span>{gpu.vram} MB</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
              <span className="flex items-center text-muted-foreground">Cores:</span>
              <span>{gpu?.cores || 'Unknown'}</span>
            </div>
          </div>
        </Card>

        {/* Info */}
        <Card className="col-span-1 p-6 bg-card/50 border-border/50 shadow-sm flex flex-col h-80 overflow-y-auto">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Hardware Info</h3>
          {gpu ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Vendor:</span>
                <span className="font-medium text-right">{gpu.vendor}</span>
                <span className="text-muted-foreground">Model:</span>
                <span className="font-medium text-right">{gpu.model}</span>
                <span className="text-muted-foreground">Bus:</span>
                <span className="font-medium text-right">{gpu.bus}</span>
                <span className="text-muted-foreground">VRAM Dynamic:</span>
                <span className="font-medium text-right">{gpu.vramDynamic ? 'Yes' : 'No'}</span>
                <span className="text-muted-foreground">Metal Support:</span>
                <span className="font-medium text-right">{gpu.metalVersion || 'Unknown'}</span>
              </div>
              <div className="mt-4 p-3 bg-muted/30 rounded-md border border-border/50 text-xs text-muted-foreground">
                <Monitor className="w-4 h-4 mb-2" />
                Note: Apple Silicon unified memory GPUs dynamically allocate VRAM. Precise
                sub-component load (Render, Tiler) is not accessible without native metal bindings.
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No GPU detected by monitoring daemon.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
