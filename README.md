# 🔍 Bulk DuckDuckGo Search Tool


[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Powered by ScrapeAutomate](https://img.shields.io/badge/Powered%20by-ScrapeAutomate-orange)](https://scrapeautomate.com)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or later
- **pnpm** 8.0 or later
- A **Redis server** (for BullMQ)

### Installation Steps

1. **Clone the Repository**

   ```
   git clone https://github.com/dataautomators/bulk-duckduckgo-search-tool.git
   cd bulk-duckduckgo-search-tool
   ```

2. **Install Dependencies**

   ```
   pnpm install
   ```

3. **Start Docker Services**

   ```
   docker compose up -d
   ```

4. **Configure Environment Variables**

   Copy the example environment file and customize it as needed:

   ```
   cp .env.example .env
   ```

5. **Deploy the Database**

   Sync your database with the following command:

   ```
   pnpm db:deploy
   ```

6. **Run the Development Server**

   Start your development server:

   ```
   pnpm dev
   ```

7. **Access the Application**

   Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- **Bulk Search**: Perform multiple searches simultaneously.
- **User-Friendly Interface**: Built on Next.js for a seamless experience.


## License

This project is licensed under the MIT License.

## Acknowledgments

A product of [DataAutomators](https://dataautomators.io)

