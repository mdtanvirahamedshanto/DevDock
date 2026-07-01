export const IPC_CHANNELS = {
  SYSTEM_INFO: 'system:info',
  DOCKER_CONTAINERS: 'docker:containers',
  PORT_LIST: 'port:list',
  PROCESSES_LIST: 'processes:list',
  PROCESSES_ACTION: 'processes:action',
  PORTS_LIST: 'ports:list',
  PORTS_KILL: 'ports:kill',
  PROJECTS_SCAN: 'projects:scan',
  PROJECTS_START: 'projects:start',
  PROJECTS_STOP: 'projects:stop',
  PROJECTS_ENV_READ: 'projects:env:read',
  PROJECTS_ENV_WRITE: 'projects:env:write',
  DB_CONNECT: 'db:connect',
  DB_DISCONNECT: 'db:disconnect',
  DB_QUERY: 'db:query',
  DB_TABLES: 'db:tables',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
