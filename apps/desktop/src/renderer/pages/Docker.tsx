import React, { useEffect } from 'react';
import { useDockerStore } from '../store/useDockerStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Button,
  useToast,
} from '@devdock/ui';
import { Box, Play, Square, Trash2, Network, HardDrive, Layers } from 'lucide-react';

export const Docker: React.FC = () => {
  const { containers, images, volumes, networks, fetchData, executeAction } = useDockerStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAction = async (entity: string, action: string, id: string) => {
    const success = await executeAction(entity, action, id);
    if (success) {
      toast({ title: 'Success', description: `${action} completed on ${entity}.` });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${action} ${entity}.`,
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024,
      sizes = ['B', 'KB', 'MB', 'GB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Docker Center</h2>
          <p className="text-muted-foreground">
            Manage your local containers, images, and volumes.
          </p>
        </div>
      </div>

      <Tabs defaultValue="containers" className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between shrink-0 mb-4">
          <TabsList>
            <TabsTrigger value="containers" className="flex items-center space-x-2">
              <Box className="w-4 h-4" />
              <span>Containers</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>Images</span>
            </TabsTrigger>
            <TabsTrigger value="volumes" className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4" />
              <span>Volumes</span>
            </TabsTrigger>
            <TabsTrigger value="networks" className="flex items-center space-x-2">
              <Network className="w-4 h-4" />
              <span>Networks</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Containers Tab */}
        <TabsContent
          value="containers"
          className="flex-1 overflow-auto rounded-md border border-border bg-card mt-0"
        >
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Ports</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {containers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No containers found.
                  </TableCell>
                </TableRow>
              ) : (
                containers.map((c) => (
                  <TableRow key={c.Id}>
                    <TableCell className="font-medium">{c.Names[0]?.replace('/', '')}</TableCell>
                    <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">
                      {c.Image}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.State === 'running' ? 'default' : 'secondary'}>
                        {c.State}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {c.Ports.map(
                        (p: any) => `${p.PublicPort || p.PrivatePort}:${p.PrivatePort}`,
                      ).join(', ')}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {c.State === 'running' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAction('container', 'stop', c.Id)}
                        >
                          <Square className="w-4 h-4 text-orange-500" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAction('container', 'start', c.Id)}
                        >
                          <Play className="w-4 h-4 text-green-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAction('container', 'remove', c.Id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent
          value="images"
          className="flex-1 overflow-auto rounded-md border border-border bg-card mt-0"
        >
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
              <TableRow>
                <TableHead>Repository / Tag</TableHead>
                <TableHead>Image ID</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images.map((i) => (
                <TableRow key={i.Id}>
                  <TableCell className="font-medium">{i.RepoTags?.[0] || '<none>'}</TableCell>
                  <TableCell className="font-mono text-muted-foreground text-sm truncate max-w-[150px]">
                    {i.Id.replace('sha256:', '').substring(0, 12)}
                  </TableCell>
                  <TableCell className="text-sm">{formatBytes(i.Size)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAction('image', 'remove', i.Id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Volumes Tab */}
        <TabsContent
          value="volumes"
          className="flex-1 overflow-auto rounded-md border border-border bg-card mt-0"
        >
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Mountpoint</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volumes.map((v) => (
                <TableRow key={v.Name}>
                  <TableCell className="font-medium truncate max-w-[200px]" title={v.Name}>
                    {v.Name}
                  </TableCell>
                  <TableCell className="text-sm">{v.Driver}</TableCell>
                  <TableCell
                    className="font-mono text-xs text-muted-foreground truncate max-w-[250px]"
                    title={v.Mountpoint}
                  >
                    {v.Mountpoint}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAction('volume', 'remove', v.Name)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Networks Tab */}
        <TabsContent
          value="networks"
          className="flex-1 overflow-auto rounded-md border border-border bg-card mt-0"
        >
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {networks.map((n) => (
                <TableRow key={n.Id}>
                  <TableCell className="font-medium">{n.Name}</TableCell>
                  <TableCell className="text-sm">{n.Driver}</TableCell>
                  <TableCell className="text-sm">{n.Scope}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAction('network', 'remove', n.Id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};
