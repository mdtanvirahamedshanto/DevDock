import React from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { useMonitoringStore } from '../store/useMonitoringStore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@devdock/ui';
import type { Theme } from '@devdock/settings';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const { pollingInterval, setPollingInterval } = useMonitoringStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your application preferences.</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="polling-interval">Data Refresh Rate</Label>
            <p className="text-xs text-muted-foreground">
              Controls how frequently telemetry data is collected. Lower values provide more
              responsiveness at the cost of slightly higher CPU overhead.
            </p>
            <Select
              value={String(pollingInterval)}
              onValueChange={(v) => setPollingInterval(Number(v))}
            >
              <SelectTrigger id="polling-interval">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500">0.5s — Ultra-Responsive</SelectItem>
                <SelectItem value="1000">1s — Real-time (Default)</SelectItem>
                <SelectItem value="2000">2s — Balanced</SelectItem>
                <SelectItem value="3000">3s — Efficient</SelectItem>
                <SelectItem value="5000">5s — Low Overhead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
