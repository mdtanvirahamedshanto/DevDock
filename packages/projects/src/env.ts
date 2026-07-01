import fs from 'fs/promises';
import path from 'path';

export interface EnvVars {
  [key: string]: string;
}

export const readEnvFile = async (projectPath: string): Promise<EnvVars> => {
  try {
    const envPath = path.join(projectPath, '.env');
    const content = await fs.readFile(envPath, 'utf-8');
    const lines = content.split('\n');
    const env: EnvVars = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      if (key) {
        env[key.trim()] = rest
          .join('=')
          .trim()
          .replace(/^["']|["']$/g, '');
      }
    }
    return env;
  } catch (e) {
    // If file doesn't exist, return empty
    return {};
  }
};

export const writeEnvFile = async (projectPath: string, env: EnvVars): Promise<boolean> => {
  try {
    const envPath = path.join(projectPath, '.env');
    const content = Object.entries(env)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    await fs.writeFile(envPath, content, 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to write .env', e);
    return false;
  }
};
