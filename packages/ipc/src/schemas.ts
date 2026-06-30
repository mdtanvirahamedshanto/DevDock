import { z } from 'zod';

export const systemInfoSchema = z.object({
  platform: z.string(),
  arch: z.string(),
  memoryTotal: z.number(),
  memoryFree: z.number(),
});

export type SystemInfo = z.infer<typeof systemInfoSchema>;
