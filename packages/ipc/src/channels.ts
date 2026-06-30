export const IPC_CHANNELS = {
  SYSTEM_INFO: 'system:info',
  DOCKER_CONTAINERS: 'docker:containers',
  PORT_LIST: 'port:list',
} as const;

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];
