export const IPC_CHANNELS = {
  SYSTEM_INFO: 'system:info',
  DOCKER_CONTAINERS: 'docker:containers',
  PORT_LIST: 'port:list',
  PROCESSES_LIST: 'processes:list',
  PROCESSES_ACTION: 'processes:action',
  PORTS_LIST: 'ports:list',
  PORTS_KILL: 'ports:kill',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
