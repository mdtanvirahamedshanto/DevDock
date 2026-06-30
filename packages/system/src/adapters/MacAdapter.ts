import { IDeviceAdapter } from './IDeviceAdapter';

export class MacAdapter implements IDeviceAdapter {
  getPlatform(): string {
    return 'darwin';
  }

  async getCPUTemperature(): Promise<number | null> {
    // macOS requires external tools like smc or iStats for temperature
    // Returning null for graceful degradation if not available
    return null;
  }
}
