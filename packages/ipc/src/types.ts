export interface ErrorModel {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  hint?: string;
}

export interface IpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ErrorModel;
  timestamp: string;
  requestId: string;
}
