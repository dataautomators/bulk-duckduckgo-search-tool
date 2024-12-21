"use client";

import { useState } from "react";
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
  const storedTheme = localStorage.getItem('theme') || 'dark';
  const [theme, setTheme] = useState(storedTheme); 


  const switchTheme = () =>{
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

}



  const handleSearch = async () => {
    const queryArray = queries.split("\n").filter((query) => query.trim() !== "");
    const searchResults = await Promise.all(
      queryArray.map(async (query) => {
        // Replace with actual search logic
        return { query, result: `Result for ${query}`, status: "Success" };
      })
    );
    setResults(searchResults);
  };

  return (
    <div>

<div className="absolute top-6 right-8">
          <button 
            onClick={switchTheme}
            className="h-12 w-12 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="fill-violet-700 block dark:hidden" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
            <svg className="fill-yellow-500 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </button>
</div>


    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="container mx-auto p-6 flex-grow flex flex-col items-center">
            <header className="w-full py-2 mb-8">
            <div className="container mx-auto px-4">
  <div className="flex flex-col items-center">
    <div className="grid items-center justify-center "> {/* Changed gap from 4 to 2 */}
      <h1 className="text-4xl font-bold text-gray-800 mb-2"> {/* Added mb-2 for slight spacing */}
        Bulk DuckDuckGo Search Tool
      </h1>
      <div className="flex justify-end items-center space-x-2 text-gray-600">
        <span className="text-lg">Powered by</span>
        <a 
          href="https://scrapeautomate.com/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          ScrapeAutomate
        </a>
      </div>
                </div>
              </div>
            </div>

            </header>

        
        <div className="mb-4 p-6 bg-white shadow-md rounded-lg w-full max-w-5xl">
          <label htmlFor="queries" className="block text-sm font-medium text-gray-700 mb-2">
            Enter search queries (one per line):
          </label>
          <textarea
            id="queries"
            className="w-full p-2 border rounded mb-4 resize-none"
            rows={10}
            placeholder="Enter search queries..."
            value={queries}
            onChange={(e) => setQueries(e.target.value)}
          />
          
          <div className="flex justify-center space-x-4 mb-4">
            <select
              className="px-4 py-2 border rounded bg-white"
              value={searchMethod}
              onChange={(e) => setSearchMethod(e.target.value)}
            >
              <option value="ScrapeAutomate">ScrapeAutomate</option>
              <option value="Puppeteer">Puppeteer</option>
            </select>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-200"
              onClick={handleSearch}
            >
              Process
            </button>
          </div>
        </div>

        <div className="w-full  max-w-5xl mt-4">
          <Table className="bg-white shadow-md rounded-lg">
            <TableCaption>Search Results</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={index}>
                  <TableCell>{result.query}</TableCell>
                  <TableCell>{result.result}</TableCell>
                  <TableCell>{result.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  Total Queries: {results.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

      </div>

<footer className="bg-gray-800  text-white text-center py-4">
  <p className="flex items-center justify-center gap-1">
    © {new Date().getFullYear()} 
    <a 
      href="https://dataautomators.io/" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
    >
      Data Automators
    </a>
    . All rights reserved.
  </p>
</footer>
    </div>
    </div>
  );
}
