import React from 'react';
import { useFileStore } from '../store/useFileStore';
import { useProjectStore } from '../store/useProjectStore';
import {
  Button,
  Badge,
  useToast,
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
} from '@devdock/ui';
import { Folder, HardDrive, Copy, Trash2, Search, Loader2 } from 'lucide-react';

export const Files: React.FC = () => {
  const {
    targetPath,
    largeFiles,
    duplicates,
    isScanning,
    setTargetPath,
    scanLargeFiles,
    scanDuplicates,
    deleteFile,
  } = useFileStore();
  const { projects } = useProjectStore();
  const { toast } = useToast();

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024,
      sizes = ['B', 'KB', 'MB', 'GB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = async (path: string) => {
    const success = await deleteFile(path);
    if (success) toast({ title: 'File deleted' });
    else toast({ variant: 'destructive', title: 'Failed to delete file' });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="flex items-center space-x-4">
          <select
            className="flex h-10 w-64 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={targetPath || ''}
            onChange={(e) => setTargetPath(e.target.value)}
          >
            <option value="" disabled>
              Select Workspace...
            </option>
            {Object.values(projects).map((p) => (
              <option key={p.id} value={p.path}>
                {p.name} ({p.path})
              </option>
            ))}
          </select>
        </div>
      </div>

      {targetPath ? (
        <Tabs defaultValue="large" className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between shrink-0 mb-4">
            <TabsList>
              <TabsTrigger value="large" className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4" />
                <span>Large Files</span>
              </TabsTrigger>
              <TabsTrigger value="duplicates" className="flex items-center space-x-2">
                <Copy className="w-4 h-4" />
                <span>Duplicates</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Large Files Tab */}
          <TabsContent
            value="large"
            className="flex-1 flex flex-col overflow-hidden rounded-md border border-border bg-card mt-0"
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <span className="text-sm text-muted-foreground">Find files larger than 10MB</span>
              <Button onClick={() => scanLargeFiles()} disabled={isScanning}>
                {isScanning ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Scan Large Files
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {largeFiles.length === 0 && !isScanning ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No large files found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    largeFiles.map((f, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{f.name}</TableCell>
                        <TableCell
                          className="text-xs text-muted-foreground font-mono truncate max-w-xs"
                          title={f.path}
                        >
                          {f.path.replace(targetPath, '')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{formatBytes(f.size)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(f.path)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Duplicates Tab */}
          <TabsContent
            value="duplicates"
            className="flex-1 flex flex-col overflow-hidden rounded-md border border-border bg-card mt-0"
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <span className="text-sm text-muted-foreground">
                Deep scan for exact file copies (MD5 Hashing)
              </span>
              <Button onClick={() => scanDuplicates()} disabled={isScanning}>
                {isScanning ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Scan Duplicates
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {duplicates.length === 0 && !isScanning && (
                <div className="text-center text-muted-foreground mt-10">
                  No duplicate files found.
                </div>
              )}
              {duplicates.map((group, i) => (
                <div key={i} className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 p-2 flex justify-between items-center border-b border-border">
                    <span className="text-xs font-mono text-muted-foreground">
                      Hash: {group[0].hash}
                    </span>
                    <Badge>{formatBytes(group[0].size)}</Badge>
                  </div>
                  {group.map((f, j) => (
                    <div
                      key={j}
                      className="p-3 flex justify-between items-center hover:bg-muted/20 border-b border-border last:border-0"
                    >
                      <div className="truncate flex-1 mr-4">
                        <div className="font-medium text-sm">{f.name}</div>
                        <div
                          className="text-xs text-muted-foreground font-mono truncate"
                          title={f.path}
                        >
                          {f.path.replace(targetPath, '')}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(f.path)}
                        className="shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg m-2">
          <Folder className="w-16 h-16 mb-4 opacity-50" />
          <p>Select a workspace to analyze files.</p>
        </div>
      )}
    </div>
  );
};
