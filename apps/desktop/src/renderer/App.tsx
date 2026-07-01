import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/Settings';
import { Processes } from './pages/Processes';
import { Ports } from './pages/Ports';
import { Projects } from './pages/Projects';
import { Databases } from './pages/Databases';
import { Docker } from './pages/Docker';
import { Git } from './pages/Git';
import { Files } from './pages/Files';
import { TerminalPage } from './pages/TerminalPage';
import { Monitoring } from './pages/Monitoring';
import { TrayPopup } from './pages/TrayPopup';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@devdock/ui';
import './index.css';
import '@devdock/ui/src/globals.css';

const queryClient = new QueryClient();

// Detect if running in tray popup context (via URL hash)
const isTrayPopup = window.location.hash === '#/tray';

export const App: React.FC = () => {
  if (isTrayPopup) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TrayPopup />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="processes" element={<Processes />} />
              <Route path="ports" element={<Ports />} />
              <Route path="projects" element={<Projects />} />
              <Route path="databases" element={<Databases />} />
              <Route path="docker" element={<Docker />} />
              <Route path="git" element={<Git />} />
              <Route path="files" element={<Files />} />
              <Route path="terminal" element={<TerminalPage />} />
              <Route path="monitoring" element={<Monitoring />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route
                path="*"
                element={
                  <div className="p-6 text-muted-foreground flex h-full items-center justify-center">
                    Work in progress...
                  </div>
                }
              />
            </Route>
          </Routes>
        </MemoryRouter>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
};
