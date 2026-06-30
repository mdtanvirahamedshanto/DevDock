# DevDock 🚢

**Developer Workspace Control Center**

DevDock is an enterprise-grade, cross-platform desktop application designed to be the ultimate all-in-one workspace manager for developers. It replaces scattered utilities by centralizing Port Management, Process Monitoring, Docker orchestration, and Terminal management into a single, highly optimized native interface.

![DevDock Interface](https://via.placeholder.com/1200x600.png?text=DevDock+Dashboard)

## Features

- **Port Manager:** Discover, monitor, and terminate conflicting ports.
- **Process Manager:** Inspect process trees, monitor CPU/Memory, suspend, or kill processes.
- **Docker Manager:** Full orchestration, container inspection, and log streaming.
- **Database Manager:** Unified UI to connect and query SQLite, Postgres, MySQL, and Redis.
- **System Telemetry:** Real-time hardware and network monitoring.
- **Plugin Architecture:** Deeply extensible SDK for custom automation.

## Architecture

DevDock is a monorepo powered by **Turborepo** and **pnpm**.

- **Frontend:** React 18, Vite, Tailwind CSS, Shadcn UI, Zustand, TanStack Query.
- **Desktop Shell:** Electron (Strict Context Isolation, No Node Integration in Renderer).
- **Backend Services:** Node.js, Better SQLite3, Drizzle ORM.
- **Validation:** End-to-end Zod schemas across the IPC boundary.

The architecture strictly follows Domain-Driven Design. UI is completely decoupled from OS logic.

## Installation

### Prerequisites
- Node.js >= 18
- pnpm >= 9

### Getting Started
```bash
# Clone the repository
git clone https://github.com/mdtanvirahamedshanto/DevDock.git
cd DevDock

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct, development workflow, and the process for submitting Pull Requests.

### Monorepo Structure
- `apps/desktop`: The main Electron shell and React UI.
- `packages/*`: Highly decoupled domain packages (e.g., `system`, `ports`, `database`).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
