import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@devdock/ui';
import { Settings, LayoutDashboard, Terminal, Box, Activity } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Toolbar - Drag region for frameless windows */}
        <header
          className="h-12 border-b border-border flex items-center px-4 bg-card/50 backdrop-blur-sm z-10"
          style={{ WebkitAppRegion: 'drag' } as any}
        >
          <div className="flex-1" />
          <div
            className="text-xs text-muted-foreground"
            style={{ WebkitAppRegion: 'no-drag' } as any}
          >
            Press{' '}
            <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border">⌘ K</kbd>{' '}
            to search
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Status Bar */}
        <footer className="h-8 border-t border-border flex items-center px-4 bg-card text-xs text-muted-foreground z-10 space-x-4">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Daemon Online</span>
          </div>
          <span>•</span>
          <span>Docker: Connected</span>
          <div className="flex-1" />
          <span>DevDock Enterprise v0.1.0</span>
        </footer>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/processes'))}>
              <Activity className="mr-2 h-4 w-4" />
              <span>Processes</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/docker'))}>
              <Box className="mr-2 h-4 w-4" />
              <span>Docker</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/terminal'))}>
              <Terminal className="mr-2 h-4 w-4" />
              <span>Terminal</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};
