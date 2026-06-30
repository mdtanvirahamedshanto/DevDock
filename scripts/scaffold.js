const fs = require('fs');
const path = require('path');

const packages = [
  'database', 'logger', 'security', 'system', 'monitoring', 
  'ports', 'processes', 'projects', 'docker', 'git', 
  'terminal', 'plugin-sdk', 'updater', 'notifications', 
  'settings', 'telemetry', 'testing', 'icons', 'types', 
  'shared', 'utils'
];

const packagesDir = path.join(__dirname, '..', 'packages');

packages.forEach(pkg => {
  const pkgDir = path.join(packagesDir, pkg);
  const srcDir = path.join(pkgDir, 'src');
  const testsDir = path.join(pkgDir, 'tests');

  // Create directories
  fs.mkdirSync(srcDir, { recursive: true });
  fs.mkdirSync(testsDir, { recursive: true });

  // package.json
  const packageJson = {
    name: `@devdock/${pkg}`,
    version: "0.0.0",
    private: true,
    main: "src/index.ts",
    types: "src/index.ts",
    dependencies: {},
    devDependencies: {
      "@devdock/typescript-config": "workspace:*",
      "@devdock/eslint-config": "workspace:*"
    }
  };
  fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  // src/index.ts
  fs.writeFileSync(path.join(srcDir, 'index.ts'), `export const name = '@devdock/${pkg}';\n`);

  // tsconfig.json
  const tsConfig = {
    extends: "@devdock/typescript-config/base.json",
    compilerOptions: {
      outDir: "dist"
    },
    include: ["src"]
  };
  fs.writeFileSync(path.join(pkgDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));

  // README.md
  fs.writeFileSync(path.join(pkgDir, 'README.md'), `# @devdock/${pkg}\n\nInternal package for ${pkg} functionality.\n`);

  console.log(`Scaffolded @devdock/${pkg}`);
});
