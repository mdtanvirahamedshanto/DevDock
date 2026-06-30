import { Worker } from 'worker_threads';

export class WorkerManager {
  private workers: Map<string, Worker> = new Map();

  public spawnWorker(name: string, scriptPath: string): void {
    if (this.workers.has(name)) {
      throw new Error(`Worker ${name} is already running.`);
    }

    const worker = new Worker(scriptPath);

    worker.on('error', (err) => {
      console.error(`Worker [${name}] error:`, err);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker [${name}] stopped with exit code ${code}`);
      }
      this.workers.delete(name);
    });

    this.workers.set(name, worker);
  }

  public terminateWorker(name: string): void {
    const worker = this.workers.get(name);
    if (worker) {
      worker.terminate();
      this.workers.delete(name);
    }
  }

  public terminateAll(): void {
    for (const [name, worker] of this.workers.entries()) {
      worker.terminate();
      this.workers.delete(name);
    }
  }
}
