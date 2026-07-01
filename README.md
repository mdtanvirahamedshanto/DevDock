# DevDock 🚢

DevDock is a colossal, unified Desktop application engineered for modern developers. It aims to completely replace the fragmented tooling ecosystem (Task Manager, Docker Desktop, Database Clients, Terminals) into one visually stunning, high-performance interface.

Built with **Electron**, **React**, **Zustand**, **Shadcn UI**, and a massive **Pnpm TurboRepo** workspace architecture.

## 🌟 Master Feature List (Completed Phases)

1. **Dashboard & Widget System**: Real-time system telemetry cards.
2. **Process Manager**: A native task manager (kill, suspend, resume) via `ps-list` IPC hooks.
3. **Port Manager**: Maps active TCP/UDP ports, detects conflicts, and force-kills locking processes via `netstat` and `lsof`.
4. **Project Manager**: Recursively scans workspaces, automatically detects frameworks (Next.js, Vue, Laravel), and manages Env files and Node instances.
5. **Database Center**: A built-in connection manager for MySQL and PostgreSQL. Provides a SQL execution terminal and schema viewer!
6. **Docker Manager**: Interacts natively with the Docker daemon (`/var/run/docker.sock`) to manage containers, images, volumes, and networks.
7. **Git Interface**: Wraps `simple-git` for visual commits, pushing, pulling, and branch switching directly within your workspace roots.
8. **File Manager (Disk Sweeper)**: A multi-threaded scanner that deeply crawls for files >10MB and clusters identical files by executing MD5 byte-hashing for instant deduplication.
9. **Terminal Emulator**: Integrates `node-pty` and `xterm.js` to spawn authentic, native local Zsh/Bash/PowerShell multi-tab instances that auto-resize fluidly.
10. **System Monitoring**: A 60-FPS push-based telemetry engine (`systeminformation` + `recharts`) tracking CPU, RAM, Network I/O, and physical disk S.M.A.R.T status in real-time.

## 🚀 Installation & Build

### Developer Setup

```bash
# Clone the repository
git clone https://github.com/mdtanvirahamedshanto/DevDock.git

# Install dependencies (requires Pnpm)
pnpm install

# Start the TurboRepo dev servers (React frontend + Electron backend)
pnpm run dev
```

### Production Release

DevDock automatically compiles installers for Mac (`.dmg`), Windows (`.exe`), and Linux (`.AppImage`) via GitHub Actions.

To trigger a build:

1. Commit your changes.
2. Create and push a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions will handle compiling native dependencies (`node-pty`, `sqlite3`, etc.), packaging the app via `electron-builder`, and uploading it to the GitHub Releases page.

## 🏗️ Architecture

DevDock utilizes a highly modular **TurboRepo** architecture. The `apps/desktop` package acts purely as a UI renderer and an IPC router. All actual operating system logic is isolated into independent node modules:

- `@devdock/core`: App Recovery, Logging, Global Events.
- `@devdock/ui`: Shadcn/Radix primitive components.
- `@devdock/system`, `@devdock/processes`, `@devdock/ports`, `@devdock/monitoring`: Native telemetry engines.
- `@devdock/projects`, `@devdock/files`: High-performance filesystem crawlers.
- `@devdock/database`, `@devdock/docker`, `@devdock/git`, `@devdock/terminal`: Wrappers for external developer tooling.
