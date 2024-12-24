"use client";

import { getSearches, deleteSearchesByFingerprint, deleteSearchById } from "@/app/actions";
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
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSearchParams } from "next/navigation";
import Pagination from "./pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ResultAccordion({ result }: { result: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const restResults = result.slice(1);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2 w-full">
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
            {restResults.map((item, index) => (
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
  const [counts, setCounts] = useState({ pendingCount: 0, completedCount: 0, failedCount: 0 });
  const params = useSearchParams();
  const pageParam = params.get("page");
  const [pageSize, setPageSize] = useState(10);
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

      const { searches, meta, counts } = await getSearches(fingerprint, page, pageSize);

      if (meta) {
        setMeta(meta);
      }

      if (counts) {
        setCounts(counts);
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
  }, [fingerprint, pageParam, pageSize]);

  const handleClear = async () => {
    if (fingerprint) {
      await deleteSearchesByFingerprint(fingerprint);
      setSearchResults([]);
      setCounts({ pendingCount: 0, completedCount: 0, failedCount: 0 });
    }
  };

  const handleDelete = async (searchId: string) => {
    await deleteSearchById(searchId);
    setSearchResults(searchResults.filter((search) => search.id !== searchId));
    // Update counts dynamically
    setCounts((prevCounts) => {
      const deletedSearch = searchResults.find((search) => search.id === searchId);
      if (!deletedSearch) return prevCounts;

      const newCounts = { ...prevCounts };
      if (deletedSearch.status === "PENDING") newCounts.pendingCount -= 1;
      if (deletedSearch.status === "COMPLETED") newCounts.completedCount -= 1;
      if (deletedSearch.status === "FAILED") newCounts.failedCount -= 1;

      return newCounts;
    });
  };

  return (
    <div className="mb-4 p-6 shadow-md rounded-lg w-full max-w-5xl space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <div className="flex justify-center items-center space-x-4">
            <div className="text-yellow-500">Pending: {counts.pendingCount}</div>
            <div className="text-green-500">Completed: {counts.completedCount}</div>
            <div className="text-red-500">Failed: {counts.failedCount}</div>
          </div>
        </div>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => setPageSize(parseInt(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Page Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table className="rounded-lg border">
        <TableCaption></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-primary md:w-[30%]">Query</TableHead>
            <TableHead className="text-primary w-full">Result</TableHead>
            <TableHead className="text-primary text-center">Status</TableHead>
            <TableHead className="text-primary text-center">Actions</TableHead>
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
              <TableCell className="border-b text-center">
                <Button variant="outline" size="sm" onClick={() => handleDelete(searchResult.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-right font-bold">
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