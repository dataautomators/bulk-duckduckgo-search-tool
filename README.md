# 🔍 Bulk DuckDuckGo Search Tool

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-13-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Powered by ScrapeAutomate](https://img.shields.io/badge/Powered%20by-ScrapeAutomate-orange)](https://scrapeautomate.com)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- pnpm 8.0 or later
- Redis server (for BullMQ)

### Installation

1. Clone the repository

```bash
git clone https://github.com/dataautomators/bulk-duckduckgo-search-tool.git
cd bulk-duckduckgo-search-tool
```

2. Install the dependencies:

```bash
pnpm install
```

3. Copy the `.env.example` file to `.env` and update the environment variables:

```bash
cp .env.example .env
```

4. Sync the database:

```bash
pnpm db:deploy
```

4. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
