import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['systemInfo'],
    queryFn: () => window.electron.invoke('system:info'),
  });

  if (isLoading) return <div>Loading system info...</div>;
  if (error) return <div>Error loading system info</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
    <nav style={{ width: '250px', background: '#1e1e2f', color: '#fff', padding: '1rem' }}>
      <h1>DevDock</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link></li>
        <li><Link to="/processes" style={{ color: '#fff', textDecoration: 'none' }}>Processes</Link></li>
      </ul>
    </nav>
    <main style={{ flex: 1, padding: '2rem', background: '#f5f5f5' }}>
      {children}
    </main>
  </div>
);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/processes" element={<div>Process Manager (Coming Soon)</div>} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
