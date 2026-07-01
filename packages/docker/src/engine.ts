import Docker from 'dockerode';

export class DockerEngine {
  private docker: Docker;

  constructor() {
    // Dockerode defaults to /var/run/docker.sock on Unix or named pipe on Windows
    this.docker = new Docker();
  }

  // --- Containers ---
  async getContainers(all: boolean = true) {
    try {
      return await this.docker.listContainers({ all });
    } catch (e) {
      console.error('Failed to list containers', e);
      return [];
    }
  }

  async startContainer(id: string) {
    const container = this.docker.getContainer(id);
    await container.start();
  }

  async stopContainer(id: string) {
    const container = this.docker.getContainer(id);
    await container.stop();
  }

  async removeContainer(id: string, force: boolean = true) {
    const container = this.docker.getContainer(id);
    await container.remove({ force });
  }

  // --- Images ---
  async getImages() {
    try {
      return await this.docker.listImages();
    } catch (e) {
      console.error('Failed to list images', e);
      return [];
    }
  }

  async removeImage(id: string, force: boolean = true) {
    const image = this.docker.getImage(id);
    await image.remove({ force });
  }

  // --- Volumes ---
  async getVolumes() {
    try {
      const res = await this.docker.listVolumes();
      return res.Volumes || [];
    } catch (e) {
      console.error('Failed to list volumes', e);
      return [];
    }
  }

  async removeVolume(name: string, force: boolean = true) {
    const volume = this.docker.getVolume(name);
    await volume.remove({ force });
  }

  // --- Networks ---
  async getNetworks() {
    try {
      return await this.docker.listNetworks();
    } catch (e) {
      console.error('Failed to list networks', e);
      return [];
    }
  }

  async removeNetwork(id: string) {
    const network = this.docker.getNetwork(id);
    await network.remove();
  }
}

export const dockerEngine = new DockerEngine();
