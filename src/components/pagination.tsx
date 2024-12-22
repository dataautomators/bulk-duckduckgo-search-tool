"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  total: number;
  currentPage: number;
  pageSize: number;
}

export default function PromoterPagination({
  total,
  currentPage,
  pageSize,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / pageSize);

  const getVisiblePages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage > 3) pages.push(1, "...");
      for (
        let i = Math.max(1, currentPage - 2);
        i <= Math.min(totalPages, currentPage + 2);
        i++
      )
        pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...", totalPages);
    }
    return pages;
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage)
      return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex justify-end px-4 items-center space-x-2 mt-4">
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>

      {getVisiblePages().map((page, index) =>
        typeof page === "number" ? (
          <Button
            key={index}
            onClick={() => handlePageChange(page)}
            variant={currentPage === page ? "default" : "outline"}
            className={cn("", {
              "pointer-events-none": currentPage === page,
            })}
          >
            {page}
          </Button>
        ) : (
          <span key={index} className="px-3 py-1">
            ...
          </span>
        )
      )}

      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
}
