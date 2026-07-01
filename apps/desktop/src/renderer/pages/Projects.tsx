import React, { useEffect, useState, useRef } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge } from '@devdock/ui';
import {
  FolderPlus,
  Play,
  Square,
  RotateCw,
  Terminal as TerminalIcon,
  X,
  Settings2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@devdock/ui';

export const Projects: React.FC = () => {
  const {
    projects,
    addProject,
    startProject,
    stopProject,
    restartProject,
    removeProject,
    setupLogListener,
  } = useProjectStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setupLogListener();
  }, [setupLogListener]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [projects, selectedProjectId]);

  const projectList = Object.values(projects);
  const selectedProject = selectedProjectId ? projects[selectedProjectId] : null;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project Manager</h2>
          <p className="text-muted-foreground">Import and manage local workspaces.</p>
        </div>
        <Button onClick={addProject}>
          <FolderPlus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 shrink-0">
        {projectList.map((project) => (
          <Card key={project.id} className="flex flex-col border-primary/20 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg truncate font-bold" title={project.name}>
                  {project.name}
                </CardTitle>
                <Badge variant={project.status === 'running' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate" title={project.path}>
                {project.path}
              </p>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {project.framework}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border pt-4">
              <div className="flex space-x-1">
                {project.status === 'running' ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                      onClick={() => stopProject(project.id)}
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-500 hover:bg-blue-500/10 hover:text-blue-600"
                      onClick={() => restartProject(project.id)}
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-500 hover:bg-green-500/10 hover:text-green-600"
                    onClick={() => startProject(project.id)}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="flex space-x-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <TerminalIcon className="w-4 h-4 mr-2" />
                      Logs
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col bg-[#1e1e1e] border-gray-800 text-gray-300">
                    <DialogHeader>
                      <DialogTitle className="text-gray-100 font-mono text-sm flex items-center">
                        <TerminalIcon className="w-4 h-4 mr-2" />
                        {project.name} - Virtual Terminal
                      </DialogTitle>
                    </DialogHeader>
                    <div
                      ref={scrollRef}
                      className="flex-1 overflow-auto bg-black p-4 rounded-md font-mono text-xs whitespace-pre-wrap leading-relaxed"
                    >
                      {selectedProject?.logs?.length === 0 ? (
                        <span className="text-gray-500">
                          No logs available. Start the project to view output.
                        </span>
                      ) : (
                        selectedProject?.logs.map((log, i) => (
                          <div key={i} className="mb-1">
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" onClick={() => removeProject(project.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}

        {projectList.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-border rounded-lg p-12 text-center text-muted-foreground flex flex-col items-center">
            <FolderPlus className="w-12 h-12 mb-4 opacity-50" />
            <p>No projects imported yet.</p>
            <p className="text-sm mt-1">Click "Add Project" to scan a local workspace.</p>
          </div>
        )}
      </div>
    </div>
  );
};
