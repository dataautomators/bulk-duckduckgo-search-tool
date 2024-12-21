"use client";

import { useState } from "react";
import { fetchData } from "./actions";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Home() {
  const [queries, setQueries] = useState("");
  const [results, setResults] = useState([]);
  const [searchMethod, setSearchMethod] = useState("Puppeteer");

  const handleSearch = async () => {
    const queryArray = queries.split("\n").filter((query) => query.trim() !== "");
    const initialResults = queryArray.map((query) => ({
      query,
      result: null,
      status: "In Progress",
    }));
    setResults(initialResults);

    const searchResults = await Promise.all(
      queryArray.map(async (query) => {
        const result = await fetchData(query);
        return { ...result, status: "Completed" };
      })
    );
    setResults(searchResults);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a]"> {/* Dark background color */}
      <div className="container mx-auto p-6 flex-grow flex flex-col items-center">
        <header className="w-full py-4 mb-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center">
              <div className="grid items-center justify-center">
                <h1 className="text-4xl font-bold text-white mb-2"> {/* White text for the title */}
                  Bulk DuckDuckGo Search Tool
                </h1>
                <div className="flex justify-end items-center space-x-2 text-gray-300"> {/* Light gray text for powered by */}
                  <span className="text-lg">Powered by</span>
                  <a 
                    href="https://scrapeautomate.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  >
                    ScrapeAutomate
                  </a>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-4 p-6 bg-gray-800 shadow-md rounded-lg w-full max-w-5xl"> {/* Dark background for input area */}
          <label htmlFor="queries" className="block text-sm font-medium text-gray-300 mb-2">
            Enter search queries (one per line):
          </label>
          <textarea
            id="queries"
            className="w-full p-3 border border-gray-600 rounded mb-4 resize-none bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
            rows={10}
            placeholder="Enter search queries..."
            value={queries}
            onChange={(e) => setQueries(e.target.value)}
          />
          
          <div className="flex justify-center space-x-4 mb-4">
            <label htmlFor="searchMethod" className="sr-only">Search Method</label>
            <select
              id="searchMethod"
              className="px-4 py-2 border border-gray-600 rounded bg-gray-700 text-white shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
              value={searchMethod}
              onChange={(e) => setSearchMethod(e.target.value)}
            >
              <option value="ScrapeAutomate">ScrapeAutomate</option>
              <option value="Puppeteer">Puppeteer</option>
            </select>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition duration-200"
              onClick={handleSearch}
            >
              Process
            </button>
          </div>
        </div>

        <div className="w-full max-w-5xl mt-4">
          <Table className="bg-gray-800 shadow-md rounded-lg border border-gray-600">
            <TableCaption className="text-white">Search Results</TableCaption>
            <TableHeader>
              <TableRow className="bg-gray-700">
                <TableHead className="text-white">Query</TableHead>
                <TableHead className="text-white">Result</TableHead>
                <TableHead className="text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow 
                  key={index} 
                  className={`transition duration-150 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'} hover:bg-gray-600`}
                >
                  <TableCell className="text-white border-b border-gray-600">{result.query}</TableCell>
                  <TableCell className="text-white border-b border-gray-600">{result.result ? result.result : "Loading..."}</TableCell>
                  <TableCell className="text-white border-b border-gray-600">{result.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold text-white bg-gray-700">
                  Total Queries: {results.length}
                </TableCell> 
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      <footer className="bg-gray-900 text-white text-center py-4">
        <p className="flex items-center justify-center gap-1">
          © {new Date().getFullYear()} 
          <a 
            href="https://dataautomators.io/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:text-blue-300 transition-colors duration=200"
          >
            Data Automators
          </a>.
          All rights reserved.
        </p>
      </footer>
    </div>
  );
}