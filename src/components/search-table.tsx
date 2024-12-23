"use client";

import { getSearches } from "@/app/actions";
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
import useFingerprint from "@/hooks/useFingerprint";
import { cn } from "@/lib/utils";
import { Search } from "@prisma/client";
import { ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSearchParams } from "next/navigation";
import Pagination from "./pagination";

function ResultAccordion({ result }: { result: string[] }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const restResults = result.slice(1);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="space-y-2 w-full"
    >
      <div className="flex items-center gap-4">
        <h4 className="text-sm">1. {result[0]}</h4>
        {restResults.length > 0 && (
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        )}
      </div>
      {restResults.length > 0 && (
        <CollapsibleContent className="space-y-2">
          <ol className="list-decimal list-inside" start={2}>
            {restResults.length &&
              restResults.map((item, index) => (
                <li key={item + index} className="font-mono text-sm">
                  {item}
                </li>
              ))}
          </ol>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export default function SearchTable() {
  const [searchResults, setSearchResults] = useState<Search[]>([]);
  const params = useSearchParams();
  const pageParam = params.get("page");
  const [meta, setMeta] = useState({
    totalCount: 0,
    page: 1,
    pageSize: 10,
  });

  const { fingerprint } = useFingerprint();

  useEffect(() => {
    const fetchSearches = async () => {
      if (!fingerprint) return null;

      const page = pageParam ? parseInt(pageParam) : 1;

      const { searches, meta } = await getSearches(fingerprint, page, 10);

      if (meta) {
        setMeta(meta);
      }

      if (searches) {
        setSearchResults(searches as Search[]);
      }
    };

    fetchSearches();

    const interval = setInterval(async () => {
      await fetchSearches();
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fingerprint, pageParam]);

  return (
    <div className="mb-4 p-6 shadow-md rounded-lg w-full max-w-5xl space-y-4">
      <Table className="rounded-lg border">
        <TableCaption>Search Results</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-primary md:w-[30%]">Query</TableHead>
            <TableHead className="text-primary w-full">Result</TableHead>
            <TableHead className="text-primary text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {searchResults.map((searchResult) => (
            <TableRow key={searchResult.id}>
              <TableCell className="border-b">{searchResult.query}</TableCell>
              <TableCell className="border-b">
                {searchResult.results.length ? (
                  <ResultAccordion result={searchResult.results} />
                ) : (
                  "Loading..."
                )}
              </TableCell>
              <TableCell className="border-b text-right">
                <div
                  className={cn(
                    "text-xs p-2 inline text-white font-semibold rounded-full",
                    {
                      "bg-green-500": searchResult.status === "COMPLETED",
                      "bg-yellow-500": searchResult.status === "PENDING",
                      "bg-red-500": searchResult.status === "FAILED",
                    }
                  )}
                >
                  {searchResult.status}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className="text-right font-bold">
              {searchResults.length} of {meta.totalCount} results
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <Pagination
        total={meta.totalCount}
        currentPage={meta.page}
        pageSize={meta.pageSize}
      />
    </div>
  );
}
