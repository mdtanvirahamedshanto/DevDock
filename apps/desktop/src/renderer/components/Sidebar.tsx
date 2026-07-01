import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  Settings,
  GitBranch,
  Box,
  HardDrive,
  Terminal,
  Database,
  Folder,
} from 'lucide-react';
import { Button } from '@devdock/ui';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/processes', label: 'Processes', icon: <Activity className="w-5 h-5" /> },
  { path: '/docker', label: 'Docker', icon: <Box className="w-5 h-5" /> },
  { path: '/projects', label: 'Projects', icon: <Box className="w-5 h-5" /> },
  { path: '/databases', label: 'Databases', icon: <Database className="w-5 h-5" /> },
  { path: '/git', label: 'Git', icon: <GitBranch className="w-5 h-5" /> },
  { path: '/files', label: 'Files', icon: <Folder className="w-5 h-5" /> },
  { path: '/monitoring', label: 'Monitoring', icon: <Activity className="w-5 h-5" /> },
  { path: '/terminal', label: 'Terminal', icon: <Terminal className="w-5 h-5" /> },
  { path: '/ports', label: 'Ports', icon: <HardDrive className="w-5 h-5" /> },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-full bg-background/50 backdrop-blur-xl border-r border-border/50 flex flex-col pt-6 relative z-50">
      <div className="px-6 mb-8 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-bold text-lg">D</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground/90">DevDock</h1>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/20 rounded-lg border border-primary/30"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center space-x-3 w-full">
                  <span
                    className={`transition-transform duration-200 ${isActive ? 'scale-110 text-primary' : 'group-hover:scale-110'}`}
                  >
                    {item.icon}
                  </span>
                  <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border/50">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `relative flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              isActive
                ? 'text-primary bg-primary/20 border border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`
          }
        >
          <Settings className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium text-sm">Settings</span>
        </NavLink>
      </div>
    </div>
  );
};
