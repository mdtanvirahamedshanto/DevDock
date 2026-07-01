import type { Config } from 'tailwindcss';
import sharedConfig from '@devdock/ui/tailwind.config';

const config: Config = {
  presets: [sharedConfig],
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
};

export default config;
