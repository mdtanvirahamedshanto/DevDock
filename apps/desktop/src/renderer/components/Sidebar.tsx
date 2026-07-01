import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Settings,
  GitBranch,
  Box,
  HardDrive,
  Terminal,
  Database,
} from 'lucide-react';
import { Button } from '@devdock/ui';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/processes', label: 'Processes', icon: <Activity className="w-5 h-5" /> },
  { path: '/projects', label: 'Projects', icon: <Box className="w-5 h-5" /> },
  { path: '/databases', label: 'Databases', icon: <Database className="w-5 h-5" /> },
  { path: '/git', label: 'Git', icon: <GitBranch className="w-5 h-5" /> },
  { path: '/terminal', label: 'Terminal', icon: <Terminal className="w-5 h-5" /> },
  { path: '/ports', label: 'Ports', icon: <HardDrive className="w-5 h-5" /> },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-full bg-card border-r border-border flex flex-col pt-4">
      <div className="px-6 mb-8 flex items-center space-x-2">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">D</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">DevDock</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
};
