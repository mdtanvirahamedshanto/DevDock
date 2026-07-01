import React, { useEffect, useState } from 'react';
import { Card } from '@devdock/ui';
import { motion } from 'framer-motion';
import { Activity, Box, HardDrive, Cpu, Database, Globe, TerminalSquare } from 'lucide-react';
import { useMonitoringStore } from '../store/useMonitoringStore';

const DashboardCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  delay: number;
}> = ({ title, value, icon, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors p-6 h-full cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-muted-foreground font-medium">{title}</h3>
            <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
              {icon}
            </div>
          </div>
          <div>
            <span className="text-4xl font-bold tracking-tight text-foreground">{value}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export const Dashboard: React.FC = () => {
  const { latest, startMonitoring, stopMonitoring } = useMonitoringStore();

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  const stats = [
    {
      title: 'CPU Usage',
      value: latest ? `${latest.cpu.load.toFixed(1)}%` : '--',
      icon: <Cpu className="w-5 h-5" />,
    },
    {
      title: 'Memory Usage',
      value: latest ? `${latest.mem.percentage.toFixed(1)}%` : '--',
      icon: <HardDrive className="w-5 h-5" />,
    },
    {
      title: 'Running Containers',
      value: '3', // Mock
      icon: <Box className="w-5 h-5" />,
    },
    {
      title: 'Active Ports',
      value: '12', // Mock
      icon: <Globe className="w-5 h-5" />,
    },
    {
      title: 'Connected DBs',
      value: '2', // Mock
      icon: <Database className="w-5 h-5" />,
    },
    {
      title: 'Active Terminals',
      value: '1', // Mock
      icon: <TerminalSquare className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex flex-col space-y-8 max-w-6xl mx-auto w-full h-full">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
            Overview
          </h2>
          <p className="text-muted-foreground mt-1">
            Welcome back. Here is the current status of your workspace.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <span className="text-sm font-medium text-primary">System Normal</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <DashboardCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            delay={i * 0.1}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex-1 rounded-xl bg-card/30 backdrop-blur border border-border/50 p-8 flex flex-col items-center justify-center text-center space-y-4"
      >
        <Activity className="w-12 h-12 text-muted-foreground/30" />
        <h3 className="text-xl font-medium text-muted-foreground">DevDock Telemetry Engine</h3>
        <p className="text-sm text-muted-foreground/70 max-w-md">
          Monitoring 6 core subsystems in real-time. Use the sidebar to drill down into specific
          services.
        </p>
      </motion.div>
    </div>
  );
};
