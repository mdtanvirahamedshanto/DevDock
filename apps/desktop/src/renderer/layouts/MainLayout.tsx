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
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 p-4">
        {/* Main Content Area in rounded glassmorphism wrapper */}
        <div className="flex-1 bg-card/40 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
          {/* Top Toolbar - Drag region for frameless windows */}
          <header
            className="h-12 border-b border-border/50 flex items-center px-4 z-10 bg-transparent shrink-0"
            style={{ WebkitAppRegion: 'drag' } as any}
          >
            <div className="flex-1" />
            <div
              className="text-xs text-muted-foreground"
              style={{ WebkitAppRegion: 'no-drag' } as any}
            >
              Press{' '}
              <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border">
                ⌘ K
              </kbd>{' '}
              to search
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 relative">
            <Outlet />
          </main>

          {/* Status Bar */}
          <footer className="h-8 border-t border-border/50 flex items-center px-4 bg-transparent text-xs text-muted-foreground z-10 space-x-4 shrink-0">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
              <span>Daemon Online</span>
            </div>
            <span>•</span>
            <span>Docker: Connected</span>
            <div className="flex-1" />
            <span>DevDock Enterprise v1.0.0</span>
          </footer>
        </div>
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
