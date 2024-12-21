# Bulk DuckDuckGo Search Tool

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Overview

The Bulk DuckDuckGo Search Tool allows users to perform bulk searches on DuckDuckGo and view the results in a tabular format. This tool is powered by [ScrapeAutomate](https://scrapeautomate.com/) and provides an easy-to-use interface for managing and viewing search results.

## Features

- Perform bulk searches on DuckDuckGo
- View search results in a table
- Switch between light and dark themes
- Powered by ScrapeAutomate

## Getting Started

First, clone the repository and navigate to the project directory:

```bash
git clone https://github.com/your-username/bulk-duckduckgo-search-tool.git
cd bulk-duckduckgo-search-tool
```

Then, install the dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Configuration

This project uses Tailwind CSS for styling. You can customize the styles by editing the configuration files:

- [tailwind.config.ts](tailwind.config.ts)
- [src/app/globals.css](src/app/globals.css)

## Prisma Setup

This project uses Prisma for database management. To set up the database, run the following commands:

```bash
pnpm prisma migrate dev
```

This will apply the migrations defined in [prisma/migrations](prisma/migrations).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is licensed under the MIT License.

## Copyright

This project is copyright by [dataautomators.io](https://dataautomators.io).
