import React, { useEffect, useMemo } from 'react';
import { usePortStore } from '../store/usePortStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@devdock/ui';
import { Input, Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@devdock/ui';
import { Search, PowerOff, ShieldAlert, History, Activity, AlertTriangle } from 'lucide-react';
import { useToast } from '@devdock/ui';

export const Ports: React.FC = () => {
  const { activePorts, history, searchQuery, setSearchQuery, fetchPorts, killPort } =
    usePortStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchPorts();
    const interval = setInterval(fetchPorts, 3000);
    return () => clearInterval(interval);
  }, [fetchPorts]);

  const filteredPorts = useMemo(() => {
    let filtered = activePorts;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.port.toString().includes(q) ||
          p.processName.toLowerCase().includes(q) ||
          p.framework.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [activePorts, searchQuery]);

  const conflicts = useMemo(
    () => activePorts.filter((p) => p.isReserved && p.framework === 'Unknown'),
    [activePorts],
  );

  const handleKill = async (pid: number, port: number, force = false) => {
    const success = await killPort(pid, force);
    if (success) {
      toast({
        title: 'Port Released',
        description: `Successfully killed process on port ${port}.`,
      });
      fetchPorts();
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to release port',
        description: `Could not terminate process ${pid}. It might require admin privileges.`,
      });
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Port Manager</h2>
          <p className="text-muted-foreground">Monitor and release local TCP/UDP bindings.</p>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="bg-destructive/15 border-l-4 border-destructive text-destructive-foreground p-4 rounded-r-md shrink-0 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div>
            <h4 className="font-semibold">Reserved Port Conflict Detected</h4>
            <p className="text-sm mt-1">
              Unknown processes are bound to reserved ports (e.g. port{' '}
              {conflicts.map((c) => c.port).join(', ')}). This may cause your local servers to fail.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="active" className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between shrink-0 mb-4">
          <TabsList>
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Active Ports</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by port, process, framework..."
              className="pl-9 bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent
          value="active"
          className="flex-1 overflow-auto rounded-md border border-border bg-card mt-0"
        >
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[100px]">Port</TableHead>
                <TableHead>Process</TableHead>
                <TableHead>PID</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPorts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No active ports found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPorts.map((port) => (
                  <TableRow
                    key={`${port.port}-${port.pid}`}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-bold text-primary font-mono">{port.port}</TableCell>
                    <TableCell className="font-medium">{port.processName}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{port.pid}</TableCell>
                    <TableCell>
                      <Badge
                        variant={port.framework === 'Unknown' ? 'secondary' : 'default'}
                        className="font-mono"
                      >
                        {port.framework}
                      </Badge>
                      {port.isReserved && (
                        <Badge
                          variant="destructive"
                          className="ml-2 font-mono"
                          title="Reserved Port"
                        >
                          <ShieldAlert className="w-3 h-3 mr-1" /> Reserved
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleKill(port.pid, port.port)}
                        className="text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                      >
                        <PowerOff className="w-4 h-4 mr-2" />
                        Kill
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent
          value="history"
          className="flex-1 overflow-auto rounded-md border border-border bg-card mt-0"
        >
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[100px]">Port</TableHead>
                <TableHead>Process</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead className="text-right">Closed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    No closed ports tracked in this session yet.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((port, idx) => (
                  <TableRow key={`${port.port}-${idx}`} className="opacity-70">
                    <TableCell className="font-bold font-mono">{port.port}</TableCell>
                    <TableCell>{port.processName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{port.framework}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(port.closedAt).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};
