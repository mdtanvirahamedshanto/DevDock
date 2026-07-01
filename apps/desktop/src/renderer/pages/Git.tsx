import React, { useEffect, useState } from 'react';
import { useGitStore } from '../store/useGitStore';
import { useProjectStore } from '../store/useProjectStore';
import { Button, Input, Badge, useToast, Card } from '@devdock/ui';
import {
  GitBranch,
  GitCommit,
  ArrowDownToLine,
  ArrowUpFromLine,
  FolderArchive,
  FolderOpen,
  CheckSquare,
  Square,
} from 'lucide-react';

export const Git: React.FC = () => {
  const {
    targetPath,
    status,
    branches,
    setTargetPath,
    fetchData,
    commit,
    pull,
    push,
    stash,
    checkout,
  } = useGitStore();
  const { projects } = useProjectStore();
  const { toast } = useToast();

  const [stagedFiles, setStagedFiles] = useState<Set<string>>(new Set());
  const [commitMessage, setCommitMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Reset staged files when path changes
  useEffect(() => {
    setStagedFiles(new Set());
    setCommitMessage('');
  }, [targetPath]);

  const toggleFile = (file: string) => {
    const newStaged = new Set(stagedFiles);
    if (newStaged.has(file)) newStaged.delete(file);
    else newStaged.add(file);
    setStagedFiles(newStaged);
  };

  const toggleAll = () => {
    if (!status) return;
    if (stagedFiles.size === status.files.length) {
      setStagedFiles(new Set());
    } else {
      setStagedFiles(new Set(status.files.map((f: any) => f.path)));
    }
  };

  const handleCommit = async () => {
    if (stagedFiles.size === 0 || !commitMessage) return;
    const success = await commit(commitMessage, Array.from(stagedFiles));
    if (success) {
      toast({ title: 'Committed successfully' });
      setStagedFiles(new Set());
      setCommitMessage('');
    } else {
      toast({ variant: 'destructive', title: 'Commit failed' });
    }
  };

  const execAction = async (name: string, action: () => Promise<boolean>) => {
    const success = await action();
    if (success) toast({ title: `${name} successful` });
    else toast({ variant: 'destructive', title: `${name} failed` });
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

          {branches && (
            <div className="flex items-center space-x-2 border-l border-border pl-4">
              <GitBranch className="w-4 h-4 text-muted-foreground" />
              <select
                className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={branches.current}
                onChange={(e) => checkout(e.target.value)}
              >
                {branches.all.map((b: string) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {targetPath && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => execAction('Pull', pull)}>
              <ArrowDownToLine className="w-4 h-4 mr-2" /> Pull
            </Button>
            <Button variant="outline" onClick={() => execAction('Push', push)}>
              <ArrowUpFromLine className="w-4 h-4 mr-2" /> Push
            </Button>
            <Button variant="secondary" onClick={() => execAction('Stash', () => stash())}>
              <FolderArchive className="w-4 h-4 mr-2" /> Stash
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {targetPath ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          {/* Changes Pane */}
          <Card className="flex flex-col border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center shrink-0">
              <h3 className="font-semibold flex items-center">
                <FolderOpen className="w-4 h-4 mr-2" />
                Changes
                {status && (
                  <Badge variant="secondary" className="ml-2">
                    {status.files.length}
                  </Badge>
                )}
              </h3>
              <Button variant="ghost" size="sm" onClick={toggleAll}>
                {status && stagedFiles.size === status.files.length && status.files.length > 0
                  ? 'Unstage All'
                  : 'Stage All'}
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-2">
              {status?.files.length === 0 ? (
                <div className="text-center text-muted-foreground mt-10">
                  No changes in working directory.
                </div>
              ) : (
                status?.files.map((file: any) => (
                  <div
                    key={file.path}
                    className="flex items-center p-2 hover:bg-muted/50 rounded-md group cursor-pointer"
                    onClick={() => toggleFile(file.path)}
                  >
                    <div className="mr-3 text-primary">
                      {stagedFiles.has(file.path) ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-mono text-sm flex-1 truncate">{file.path}</span>
                    <Badge
                      variant={
                        file.index === '?'
                          ? 'secondary'
                          : file.index === 'M'
                            ? 'default'
                            : 'destructive'
                      }
                      className="text-[10px] w-6 justify-center"
                    >
                      {file.index === ' ' ? file.working_dir : file.index}
                    </Badge>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-border bg-muted/20 shrink-0 space-y-3">
              <textarea
                className="w-full h-24 rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Commit message..."
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
              />
              <Button
                className="w-full"
                disabled={stagedFiles.size === 0 || !commitMessage}
                onClick={handleCommit}
              >
                <GitCommit className="w-4 h-4 mr-2" />
                Commit {stagedFiles.size} Files
              </Button>
            </div>
          </Card>

          {/* Details / Logs Pane (Placeholder for Future Expansion) */}
          <Card className="flex flex-col border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center shrink-0">
              <h3 className="font-semibold flex items-center">
                <GitBranch className="w-4 h-4 mr-2" />
                Repository Stats
              </h3>
            </div>
            <div className="flex-1 p-6 space-y-4">
              {status && (
                <>
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-muted-foreground">Current Branch</span>
                    <span className="font-mono font-bold">{status.current}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-muted-foreground">Tracking Remote</span>
                    <span className="font-mono">{status.tracking || 'None'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-muted-foreground">Ahead</span>
                    <span className="font-mono text-green-500">{status.ahead} commits</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-muted-foreground">Behind</span>
                    <span className="font-mono text-red-500">{status.behind} commits</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg m-2">
          <GitBranch className="w-16 h-16 mb-4 opacity-50" />
          <p>Select a workspace from the top menu to view Git status.</p>
        </div>
      )}
    </div>
  );
};
