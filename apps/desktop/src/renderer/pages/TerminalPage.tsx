import React, { useEffect, useRef, useState } from 'react';
import { useTerminalStore, TerminalTab } from '../store/useTerminalStore';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Button } from '@devdock/ui';
import { Plus, X, Terminal as TerminalIcon } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

const XTermComponent: React.FC<{ tab: TerminalTab; isActive: boolean }> = ({ tab, isActive }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: '#09090b',
        foreground: '#fafafa',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const electronAPI = (window as any).electron;

    // Connect to PTY if local
    if (tab.type === 'local' && tab.ptyId) {
      term.onData((data) => {
        electronAPI.send('terminal:write', { id: tab.ptyId, data });
      });

      const handleResize = () => {
        fitAddon.fit();
        electronAPI.send('terminal:resize', { id: tab.ptyId, cols: term.cols, rows: term.rows });
      };

      term.onResize(() => {
        electronAPI.send('terminal:resize', { id: tab.ptyId, cols: term.cols, rows: term.rows });
      });

      window.addEventListener('resize', handleResize);

      // Listen for data from main process
      electronAPI.on(`terminal:data-${tab.ptyId}`, (data: string) => {
        term.write(data);
      });

      return () => {
        window.removeEventListener('resize', handleResize);
        electronAPI.removeAllListeners(`terminal:data-${tab.ptyId}`);
        term.dispose();
      };
    } else {
      term.writeln(
        `Connecting to ${tab.type} backend is under construction in Phase 10 expansion...`,
      );
      return () => term.dispose();
    }
  }, [tab]);

  // Refit when tab becomes active
  useEffect(() => {
    if (isActive && fitAddonRef.current) {
      // Small timeout to allow DOM to render display:block before fitting
      setTimeout(() => fitAddonRef.current?.fit(), 10);
    }
  }, [isActive]);

  return (
    <div
      ref={terminalRef}
      className="w-full h-full overflow-hidden"
      style={{ display: isActive ? 'block' : 'none' }}
    />
  );
};

export const TerminalPage: React.FC = () => {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTerminalStore();

  // Create initial tab if none exist
  useEffect(() => {
    if (tabs.length === 0) {
      addTab('local');
    }
  }, [tabs.length, addTab]);

  return (
    <div className="flex flex-col h-full bg-black rounded-lg border border-border overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center bg-muted/20 border-b border-border overflow-x-auto shrink-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center h-10 px-4 border-r border-border cursor-pointer transition-colors min-w-[150px] max-w-[200px] ${
              activeTabId === tab.id
                ? 'bg-black text-primary border-t-2 border-t-primary'
                : 'hover:bg-muted/50 text-muted-foreground'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <TerminalIcon className="w-4 h-4 mr-2 shrink-0" />
            <span className="text-sm truncate flex-1">{tab.title}</span>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 ml-2 rounded-sm hover:bg-muted opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-none hover:bg-muted/50 text-muted-foreground"
          onClick={() => addTab('local')}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Terminal Viewers */}
      <div className="flex-1 relative p-2">
        {tabs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground flex-col">
            <TerminalIcon className="w-12 h-12 mb-4 opacity-20" />
            <p>No active terminal sessions.</p>
          </div>
        ) : (
          tabs.map((tab) => (
            <XTermComponent key={tab.id} tab={tab} isActive={activeTabId === tab.id} />
          ))
        )}
      </div>
    </div>
  );
};
