import React, { useEffect, useState } from 'react';
import { useMonitoringStore } from '../store/useMonitoringStore';
import {
  LayoutDashboard,
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  Thermometer,
  Activity,
  Battery,
  Bluetooth,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Modules
import { DashboardModule } from './MonitoringModules/DashboardModule';
import { CPUModule } from './MonitoringModules/CPUModule';
import { GPUModule } from './MonitoringModules/GPUModule';
import { RAMModule } from './MonitoringModules/RAMModule';
import { DiskModule } from './MonitoringModules/DiskModule';
import { NetworkModule } from './MonitoringModules/NetworkModule';
import { SensorsModule } from './MonitoringModules/SensorsModule';
import { BatteryModule } from './MonitoringModules/BatteryModule';
import { BluetoothModule } from './MonitoringModules/BluetoothModule';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'cpu', label: 'CPU', icon: <Cpu className="w-4 h-4" /> },
  { id: 'gpu', label: 'GPU', icon: <Monitor className="w-4 h-4" /> },
  { id: 'ram', label: 'RAM', icon: <MemoryStick className="w-4 h-4" /> },
  { id: 'disk', label: 'Disk', icon: <HardDrive className="w-4 h-4" /> },
  { id: 'network', label: 'Network', icon: <Activity className="w-4 h-4" /> },
  { id: 'sensors', label: 'Sensors', icon: <Thermometer className="w-4 h-4" /> },
  { id: 'battery', label: 'Battery', icon: <Battery className="w-4 h-4" /> },
  { id: 'bluetooth', label: 'Bluetooth', icon: <Bluetooth className="w-4 h-4" /> },
];

export const Monitoring: React.FC = () => {
  const { startMonitoring, stopMonitoring, fetchHealth } = useMonitoringStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    startMonitoring();
    fetchHealth();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring, fetchHealth]);

  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardModule />;
      case 'cpu':
        return <CPUModule />;
      case 'gpu':
        return <GPUModule />;
      case 'ram':
        return <RAMModule />;
      case 'disk':
        return <DiskModule />;
      case 'network':
        return <NetworkModule />;
      case 'sensors':
        return <SensorsModule />;
      case 'battery':
        return <BatteryModule />;
      case 'bluetooth':
        return <BluetoothModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="flex h-full w-full bg-background rounded-xl border border-border/50 overflow-hidden shadow-sm relative">
      {/* Internal Sidebar */}
      <div className="w-48 bg-muted/20 border-r border-border/50 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-border/50 shrink-0">
          <h2 className="font-semibold text-sm tracking-tight text-foreground/80">Telemetry</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="monitoringTabIndicator"
                  className="absolute inset-0 bg-primary/10 rounded-md border border-primary/20"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-card/30 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 overflow-y-auto p-6"
          >
            {renderModule()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
