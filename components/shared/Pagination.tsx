import { PaginationState, Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  Pagination as ShadcnPagination,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationProps<TData> {
  table: Table<TData>;
  pagination: PaginationState;
  total: number;
  className?: string;
}
export function Pagination<TData>({ className, table, pagination, total }: PaginationProps<TData>) {
  const { pageIndex, pageSize } = pagination;
  const pageCount = Math.ceil(total / pageSize);

  const pageNumbers = getPageNumbers(pageIndex, pageCount);

  return (
    <ShadcnPagination className={cn(className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink type="button" onClick={() => table.setPageIndex(0)}>
            <ChevronsLeft />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink type="button" onClick={() => table.previousPage()}>
            <ChevronLeft />
          </PaginationLink>
        </PaginationItem>
        {pageNumbers.map((page, i) => {
          if (page === "ellipsis")
            return (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          else
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  type="button"
                  isActive={pageIndex === page - 1}
                  onClick={() => table.setPageIndex(page - 1)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
        })}
        <PaginationItem>
          <PaginationLink type="button" onClick={() => table.nextPage()}>
            <ChevronRight />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            type="button"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          >
            <ChevronsRight />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
}

function getPageNumbers(pageIndex: number, pageCount: number): (number | "ellipsis")[] {
  const current = pageIndex + 1;
  const maxVisible = 7;

  if (pageCount <= maxVisible) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", pageCount];
  }

  if (current >= pageCount - 3) {
    return [1, "ellipsis", pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  }

  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", pageCount];
}
