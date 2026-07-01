import React, { useEffect, useMemo } from 'react';
import { useProcessStore } from '../store/useProcessStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@devdock/ui';
import { Input } from '@devdock/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@devdock/ui';
import { Button } from '@devdock/ui';
import { MoreHorizontal, Search, Trash2, PowerOff, Pause, Play, AlertTriangle } from 'lucide-react';
import { useToast } from '@devdock/ui';

export const Processes: React.FC = () => {
  const { processes, searchQuery, setSearchQuery, fetchProcesses, executeAction } =
    useProcessStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 2000);
    return () => clearInterval(interval);
  }, [fetchProcesses]);

  const filteredProcesses = useMemo(() => {
    let filtered = processes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.pid.toString().includes(q),
      );
    }
    // Sort by CPU (descending) by default
    return filtered.sort((a, b) => b.cpu - a.cpu).slice(0, 100);
  }, [processes, searchQuery]);

  const handleAction = async (
    pid: number,
    name: string,
    action: 'kill' | 'forceKill' | 'suspend' | 'resume',
  ) => {
    const success = await executeAction(pid, action);
    if (success) {
      toast({
        title: 'Process Action Successful',
        description: `Executed ${action} on ${name} (PID: ${pid}).`,
      });
      fetchProcesses(); // Refresh immediately
    } else {
      toast({
        variant: 'destructive',
        title: 'Action Failed',
        description: `Failed to execute ${action} on ${name}. It may be protected or already terminated.`,
      });
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Process Explorer</h2>
          <p className="text-muted-foreground">Monitor and manage native OS processes.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search processes by name or PID..."
            className="pl-9 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredProcesses.length} of {processes.length} processes
        </div>
      </div>

      <div className="rounded-md border border-border bg-card flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-[100px]">PID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">CPU %</TableHead>
              <TableHead className="text-right">Mem %</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProcesses.map((process) => (
              <TableRow key={process.pid} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium font-mono text-muted-foreground">
                  {process.pid}
                </TableCell>
                <TableCell className="font-medium">{process.name}</TableCell>
                <TableCell>{process.user}</TableCell>
                <TableCell className="text-right font-mono text-primary">
                  {process.cpu.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right font-mono">{process.mem.toFixed(1)}%</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleAction(process.pid, process.name, 'suspend')}
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        <span>Suspend</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction(process.pid, process.name, 'resume')}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        <span>Resume</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleAction(process.pid, process.name, 'kill')}
                        className="text-orange-500 focus:bg-orange-500/10 focus:text-orange-500"
                      >
                        <PowerOff className="mr-2 h-4 w-4" />
                        <span>Kill</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction(process.pid, process.name, 'forceKill')}
                        className="text-red-500 focus:bg-red-500/10 focus:text-red-500 font-medium"
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <span>Force Kill</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
