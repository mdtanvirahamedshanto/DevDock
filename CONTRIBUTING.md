# Contributing to DevDock

First off, thanks for taking the time to contribute!

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution.

## Code of Conduct

This project and everyone participating in it is governed by the [DevDock Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Development Setup

1. Clone the repository
2. Install [Node.js](https://nodejs.org/) v20+ and [pnpm](https://pnpm.io/)
3. Run `pnpm install`
4. Run `pnpm dev` to start the desktop app in development mode

## Architecture

DevDock is a strict Turborepo monorepo.
All UI code resides in `apps/desktop`.
All domain logic resides in `packages/*`.

**Never bypass IPC to communicate directly with Node from the renderer.**
