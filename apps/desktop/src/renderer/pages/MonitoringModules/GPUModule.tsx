import React from 'react';
import { useMonitoringStore } from '../../store/useMonitoringStore';
import { Card, Badge } from '@devdock/ui';
import { Monitor, AlertTriangle, Layers } from 'lucide-react';

export const GPUModule: React.FC = () => {
  const { history, staticInfo } = useMonitoringStore();
  const latest = history[history.length - 1];

  if (!latest) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Waiting for telemetry...
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024,
      sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const controllers = latest.hardware.controllers;
  const displays = latest.hardware.displays || [];

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">GPU & Displays</h2>
          <p className="text-muted-foreground">Graphics Controllers & Display Metrics</p>
        </div>
      </div>

      {/* Apple Silicon Limitation Banner */}
      <Card className="p-4 bg-orange-500/5 border-orange-500/30 shadow-sm">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-orange-500 text-sm">
              Apple Silicon GPU Access Restricted
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time GPU Render %, Tiler %, and Apple Neural Engine (ANE) utilization require
              parsing{' '}
              <code className="font-mono bg-muted px-1 rounded">sudo powermetrics -s gpu,ane</code>{' '}
              — which requires elevated root privileges. These metrics show <strong>—</strong> until
              a privileged helper daemon is installed.
            </p>
          </div>
        </div>
      </Card>

      {/* GPU Controllers */}
      {controllers.length > 0 ? (
        <div className="space-y-4">
          {controllers.map((gpu: any, idx: number) => {
            const staticGpu = staticInfo?.gpuControllers?.[idx];
            return (
              <Card key={idx} className="p-6 bg-card/50 border-border/50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Monitor className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{gpu.model || 'Unknown GPU'}</h3>
                      <p className="text-sm text-muted-foreground">{gpu.vendor || 'Apple'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {gpu.vram > 0 && (
                      <Badge variant="outline">{formatBytes(gpu.vram * 1024 * 1024)} VRAM</Badge>
                    )}
                    {staticGpu?.cores && <Badge variant="outline">{staticGpu.cores} Cores</Badge>}
                  </div>
                </div>

                {/* Metric tiles: Render, Tiler, ANE */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Render Engine', sublabel: 'GPU Render %' },
                    { label: 'Tiler Engine', sublabel: 'GPU Tiler %' },
                    { label: 'Neural Engine', sublabel: 'ANE Workload %' },
                  ].map(({ label, sublabel }) => (
                    <div
                      key={label}
                      className="text-center p-4 bg-muted/20 rounded-xl border border-border/50"
                    >
                      <Layers className="w-6 h-6 mx-auto mb-2 text-muted-foreground opacity-40" />
                      <div className="text-3xl font-mono font-bold text-muted-foreground">—</div>
                      <div className="text-sm font-medium mt-1">{label}</div>
                      <div className="text-[10px] text-muted-foreground">{sublabel}</div>
                    </div>
                  ))}
                </div>

                {/* Static GPU details */}
                <div className="mt-6 pt-5 border-t border-border/30 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    ['Bus', gpu.bus || '—'],
                    ['Device ID', gpu.deviceId || '—'],
                    ['Vendor ID', gpu.vendorId || '—'],
                    ['VRAM Dynamic', gpu.vramDynamic ? 'Yes' : 'No'],
                    ['VRAM Used', gpu.memoryUsed ? formatBytes(gpu.memoryUsed * 1024 * 1024) : '—'],
                    ['VRAM Free', gpu.memoryFree ? formatBytes(gpu.memoryFree * 1024 * 1024) : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="text-sm">
                      <div className="text-muted-foreground text-xs">{label}</div>
                      <div className="font-mono font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 bg-card/50 border-border/50 shadow-sm flex flex-col items-center justify-center text-muted-foreground">
          <Monitor className="w-16 h-16 mb-4 opacity-20" />
          <p>No GPU controllers detected.</p>
        </Card>
      )}

      {/* Connected Displays */}
      {displays.length > 0 && (
        <Card className="p-6 bg-card/50 border-border/50 shadow-sm">
          <h3 className="font-semibold mb-4 text-sm text-muted-foreground flex items-center">
            <Monitor className="w-4 h-4 mr-2" /> Connected Displays ({displays.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displays.map((d: any, idx: number) => (
              <div key={idx} className="p-4 bg-muted/20 rounded-lg border border-border/50">
                <div className="font-semibold text-sm mb-3">{d.model || `Display ${idx + 1}`}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    [
                      'Resolution',
                      d.resolutionX && d.resolutionY ? `${d.resolutionX} × ${d.resolutionY}` : '—',
                    ],
                    ['Refresh Rate', d.currentRefreshRate ? `${d.currentRefreshRate} Hz` : '—'],
                    ['Color Depth', d.pixelDepth ? `${d.pixelDepth}-bit` : '—'],
                    ['Connection', d.connection || d.displayId || '—'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-muted-foreground text-xs">{label}</div>
                      <div className="font-mono font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
