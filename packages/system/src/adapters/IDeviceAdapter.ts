export interface IDeviceAdapter {
  getPlatform(): string;
  getCPUTemperature(): Promise<number | null>;
}
