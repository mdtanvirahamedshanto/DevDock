import fs from 'fs/promises';
import path from 'path';

export const detectFramework = async (projectPath: string): Promise<string> => {
  try {
    const files = await fs.readdir(projectPath);

    // Check Node.js
    if (files.includes('package.json')) {
      const pkgRaw = await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8');
      try {
        const pkg = JSON.parse(pkgRaw);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps['next']) return 'Next.js';
        if (deps['nuxt']) return 'Nuxt';
        if (deps['@nestjs/core']) return 'NestJS';
        if (deps['react']) return 'React';
        if (deps['vue']) return 'Vue';
        if (deps['angular']) return 'Angular';
        if (deps['express']) return 'Express';
        if (deps['svelte']) return 'Svelte';
        return 'Node.js';
      } catch (e) {}
    }

    // Check PHP
    if (files.includes('composer.json')) {
      const compRaw = await fs.readFile(path.join(projectPath, 'composer.json'), 'utf-8');
      if (compRaw.includes('laravel/framework')) return 'Laravel';
      return 'PHP';
    }

    // Check Python
    if (
      files.includes('requirements.txt') ||
      files.includes('Pipfile') ||
      files.includes('pyproject.toml')
    ) {
      return 'Python';
    }

    // Check Java
    if (files.includes('pom.xml') || files.includes('build.gradle')) {
      return 'Java';
    }

    // Check Go
    if (files.includes('go.mod')) {
      return 'Go';
    }

    // Check .NET
    if (files.some((f) => f.endsWith('.sln') || f.endsWith('.csproj'))) {
      return '.NET';
    }

    if (files.includes('bun.lockb')) return 'Bun';
    if (files.includes('deno.json')) return 'Deno';

    return 'Unknown';
  } catch (e) {
    return 'Unknown';
  }
};
