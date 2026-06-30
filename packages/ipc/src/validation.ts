import { z } from 'zod';

export class IpcValidationError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) {
    super('IPC Validation Error');
    this.name = 'IpcValidationError';
  }
}

export function validateIpcPayload<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new IpcValidationError(result.error.issues);
  }
  return result.data;
}
