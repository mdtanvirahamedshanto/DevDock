import { z } from 'zod';

export const ThemeSchema = z.enum(['light', 'dark', 'system']);
export type Theme = z.infer<typeof ThemeSchema>;

export const AppSettingsSchema = z.object({
  theme: ThemeSchema.default('system'),
  language: z.string().default('en'),
  developerMode: z.boolean().default(false),
  notificationsEnabled: z.boolean().default(true),
  autoUpdate: z.boolean().default(true),
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;

// IPC Channel for settings
export const SETTINGS_CHANNELS = {
  GET_ALL: 'settings:get-all',
  UPDATE: 'settings:update',
  RESET: 'settings:reset',
} as const;
