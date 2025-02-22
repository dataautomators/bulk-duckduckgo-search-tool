import SearchForm from "@/components/search-form";
import SearchTable from "@/components/search-table";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-0.5 py-6 flex-grow flex flex-col items-center sm-400:mb-2 sm:mb-4 md:mb-6">
        
        <header className="w-full py-4 mb-4">
          <div className="container mx-auto px-2">
            <div className="flex flex-col items-center">
              <div className="grid items-center text-center justify-center">
              <div className="space-y-2">
                  <h1 className="text-lg font-bold md:text-2xl lg:text-3xl xl:text-4xl">
                    Bulk DuckDuckGo Search Tool
                  </h1>
                </div>
                <div className="flex justify-end py-1 items-center text-lg xs:text-xs sm-400:text-sm text-muted-foreground space-x-2">
                  <span className="">Powered by 
                  <a
                    href="https://scrapeautomate.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-500 hover:text-blue-500/80 transition-colors duration-200"
                  > ScrapeAutomate</a>
                  </span>
                  <p>
                  |
                  </p>
                  <span className=""> Built By 
                  <a
                    href="https://scrapeautomate.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-500 hover:text-blue-500/80 transition-colors duration-200"
                  > DataAutomators
                  </a>
                  </span>
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
        <p className="flex items-center justify-center gap-1 text-sm ">
          © {new Date().getFullYear()}
          <a
            href="https://dataautomators.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white-400 text-blue-400 hover:text-blue-300 transition-colors duration=200"
          >
            DataAutomators
          </a>
          . All rights reserved.
        </p>
      </footer>
    </div>
  );
}