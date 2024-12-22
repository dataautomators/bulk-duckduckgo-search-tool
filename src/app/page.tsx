import SearchForm from "@/components/search-form";
import SearchTable from "@/components/search-table";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto p-6 flex-grow flex flex-col items-center">
        <header className="w-full py-4 mb-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center">
              <div className="grid items-center justify-center">
                <h1 className="text-4xl font-bold mb-2">
                  Bulk DuckDuckGo Search Tool
                </h1>
                <div className="flex justify-end items-center space-x-2 text-muted-foreground">
                  <span className="text-lg">Powered by</span>
                  <a
                    href="https://scrapeautomate.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-500 hover:text-blue-500/80 transition-colors duration-200"
                  >
                    ScrapeAutomate
                  </a>
                </div>
              </div>
            </div>
          </div>
        </header>

        <SearchForm />

        <Suspense fallback={<div>Loading...</div>}>
          <SearchTable />
        </Suspense>
      </div>
      <footer className="text-center py-4">
        <p className="flex items-center justify-center gap-1">
          © {new Date().getFullYear()}
          <a
            href="https://dataautomators.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors duration=200"
          >
            Data Automators
          </a>
          . All rights reserved.
        </p>
      </footer>
    </div>
  );
}
