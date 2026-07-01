import simpleGit, { SimpleGit, StatusResult } from 'simple-git';

export class GitEngine {
  private getGit(workingDirectory: string): SimpleGit {
    return simpleGit({
      baseDir: workingDirectory,
      binary: 'git',
      maxConcurrentProcesses: 6,
    });
  }

  async status(workingDirectory: string): Promise<StatusResult | null> {
    try {
      const git = this.getGit(workingDirectory);
      const isRepo = await git.checkIsRepo();
      if (!isRepo) return null;
      return await git.status();
    } catch (e) {
      console.error('Git status failed', e);
      return null;
    }
  }

  async branches(workingDirectory: string) {
    try {
      const git = this.getGit(workingDirectory);
      return await git.branch();
    } catch (e) {
      console.error('Git branch failed', e);
      return null;
    }
  }

  async commit(workingDirectory: string, message: string, files: string[]): Promise<boolean> {
    try {
      const git = this.getGit(workingDirectory);
      await git.add(files);
      await git.commit(message);
      return true;
    } catch (e) {
      console.error('Git commit failed', e);
      return false;
    }
  }

  async pull(workingDirectory: string): Promise<boolean> {
    try {
      const git = this.getGit(workingDirectory);
      await git.pull();
      return true;
    } catch (e) {
      console.error('Git pull failed', e);
      return false;
    }
  }

  async push(workingDirectory: string): Promise<boolean> {
    try {
      const git = this.getGit(workingDirectory);
      await git.push();
      return true;
    } catch (e) {
      console.error('Git push failed', e);
      return false;
    }
  }

  async stash(workingDirectory: string, message?: string): Promise<boolean> {
    try {
      const git = this.getGit(workingDirectory);
      if (message) {
        await git.stash(['save', message]);
      } else {
        await git.stash();
      }
      return true;
    } catch (e) {
      console.error('Git stash failed', e);
      return false;
    }
  }

  async checkout(workingDirectory: string, branch: string): Promise<boolean> {
    try {
      const git = this.getGit(workingDirectory);
      await git.checkout(branch);
      return true;
    } catch (e) {
      console.error('Git checkout failed', e);
      return false;
    }
  }
}

export const gitEngine = new GitEngine();
