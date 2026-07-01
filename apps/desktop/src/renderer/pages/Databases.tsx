import React, { useState } from 'react';
import { useDatabaseStore } from '../store/useDatabaseStore';
import {
  Button,
  Input,
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
} from '@devdock/ui';
import {
  Database,
  Play,
  Plus,
  Server,
  Table as TableIcon,
  Trash2,
  PowerOff,
  DatabaseZap,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@devdock/ui';

export const Databases: React.FC = () => {
  const {
    savedConnections,
    activeConnectionId,
    activeTables,
    queryResults,
    queryError,
    queryHistory,
    saveConnection,
    removeConnection,
    connect,
    disconnect,
    executeQuery,
  } = useDatabaseStore();
  const [sql, setSql] = useState('SELECT 1;');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newConn, setNewConn] = useState({
    name: '',
    engine: 'postgres' as any,
    connectionString: '',
  });

  const handleSave = () => {
    saveConnection(newConn);
    setIsNewModalOpen(false);
    setNewConn({ name: '', engine: 'postgres', connectionString: '' });
  };

  const activeConn = savedConnections.find((c) => c.id === activeConnectionId);

  return (
    <div className="flex h-full space-x-4">
      {/* Sidebar: Saved Connections */}
      <div className="w-64 border-r border-border pr-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center">
            <Database className="w-4 h-4 mr-2" />
            Connections
          </h3>
          <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>New Connection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Connection Name"
                  value={newConn.name}
                  onChange={(e) => setNewConn({ ...newConn, name: e.target.value })}
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newConn.engine}
                  onChange={(e) => setNewConn({ ...newConn, engine: e.target.value as any })}
                >
                  <option value="postgres">PostgreSQL</option>
                  <option value="mysql">MySQL / MariaDB</option>
                </select>
                <Input
                  placeholder="Connection String (e.g. postgres://user:pass@localhost:5432/db)"
                  value={newConn.connectionString}
                  onChange={(e) => setNewConn({ ...newConn, connectionString: e.target.value })}
                />
                <Button onClick={handleSave} className="w-full">
                  Save Connection
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {savedConnections.map((conn) => (
            <div
              key={conn.id}
              className={`p-3 rounded-md border ${activeConnectionId === conn.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium flex items-center truncate">
                  <Server className="w-3 h-3 mr-2 text-muted-foreground shrink-0" />
                  <span className="truncate">{conn.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => removeConnection(conn.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <Badge variant="outline" className="text-[10px]">
                  {conn.engine}
                </Badge>
                {activeConnectionId === conn.id ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-destructive"
                    onClick={disconnect}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => connect(conn.id)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
          {savedConnections.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              No saved connections.
            </div>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeConnectionId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg m-2">
            <DatabaseZap className="w-16 h-16 mb-4 opacity-50" />
            <p>Select or create a connection to begin.</p>
          </div>
        ) : (
          <Tabs defaultValue="query" className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold tracking-tight">{activeConn?.name}</h2>
                <Badge variant="outline">{activeConn?.engine}</Badge>
              </div>
              <TabsList>
                <TabsTrigger value="query">SQL Terminal</TabsTrigger>
                <TabsTrigger value="tables">Tables</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
            </div>

            {/* SQL Terminal Tab */}
            <TabsContent value="query" className="flex-1 flex flex-col mt-0 space-y-4">
              <div className="relative rounded-md border border-input bg-black/50 p-1">
                <textarea
                  className="w-full h-32 bg-transparent text-gray-100 font-mono text-sm p-3 focus:outline-none resize-y"
                  value={sql}
                  onChange={(e) => setSql(e.target.value)}
                  placeholder="SELECT * FROM users;"
                  spellCheck={false}
                />
                <Button
                  size="sm"
                  className="absolute bottom-3 right-3 shadow-lg"
                  onClick={() => executeQuery(sql)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Query
                </Button>
              </div>

              <div className="flex-1 border border-border rounded-md bg-card overflow-auto">
                {queryError ? (
                  <div className="p-4 text-destructive font-mono text-sm bg-destructive/10">
                    {queryError}
                  </div>
                ) : queryResults ? (
                  <div className="flex flex-col h-full">
                    <div className="p-2 border-b border-border text-xs text-muted-foreground flex justify-between bg-muted/30">
                      <span>{queryResults.rowCount} rows returned</span>
                      <span>Execution time: {queryResults.executionTimeMs.toFixed(2)} ms</span>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-card z-10">
                          <TableRow>
                            {queryResults.fields.map((field, i) => (
                              <TableHead key={i} className="font-mono text-xs">
                                {field}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {queryResults.rows.map((row, i) => (
                            <TableRow key={i}>
                              {queryResults.fields.map((field, j) => (
                                <TableCell key={j} className="text-sm">
                                  {row[field] === null ? (
                                    <span className="text-muted-foreground italic">null</span>
                                  ) : (
                                    String(row[field])
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground italic">
                    Ready for query...
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tables Tab */}
            <TabsContent value="tables" className="flex-1 mt-0">
              <div className="grid grid-cols-4 gap-4">
                {activeTables.map((t) => (
                  <Card
                    key={t}
                    className="p-4 flex items-center hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <TableIcon className="w-4 h-4 mr-3 text-primary" />
                    <span className="font-medium truncate">{t}</span>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent
              value="history"
              className="flex-1 mt-0 overflow-auto border border-border rounded-md bg-card"
            >
              <Table>
                <TableBody>
                  {queryHistory.map((q, i) => (
                    <TableRow key={i}>
                      <TableCell
                        className="font-mono text-sm whitespace-pre-wrap text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => setSql(q)}
                      >
                        {q}
                      </TableCell>
                    </TableRow>
                  ))}
                  {queryHistory.length === 0 && (
                    <TableRow>
                      <TableCell className="text-center py-8 text-muted-foreground">
                        No queries executed yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};
