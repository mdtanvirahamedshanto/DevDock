import fs from 'fs/promises';
import path from 'path';
import { detectFramework } from './detector';

export interface ProjectWorkspace {
  id: string;
  name: string;
  path: string;
  framework: string;
}

export const scanWorkspace = async (workspacePath: string): Promise<ProjectWorkspace | null> => {
  try {
    const stat = await fs.stat(workspacePath);
    if (!stat.isDirectory()) return null;

    const framework = await detectFramework(workspacePath);
    const name = path.basename(workspacePath);
    const id = Buffer.from(workspacePath).toString('base64'); // Simple deterministic ID

    return {
      id,
      name,
      path: workspacePath,
      framework,
    };
  } catch (e) {
    console.error('Failed to scan workspace', e);
    return null;
  }
};
