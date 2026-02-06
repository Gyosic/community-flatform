"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
  TableOptions,
  TableState,
  VisibilityState,
} from "@tanstack/react-table";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { isBoolean } from "es-toolkit";
import { isNil } from "es-toolkit/compat";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LoaderCircle,
  SquareCheck,
  SquareX,
} from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateFormatType, date, fileSize, thousandComma } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FieldModel } from "@/types";

export interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>;
  data: Array<TData>;
  autoResetPageIndex?: boolean;
  noData?: React.ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
  loading?: boolean;
  rowCount?: number;
  sorting?: SortingState;
  pagination?: PaginationState;
  manualPagination?: boolean;
  manualSorting?: boolean;
  btnGroup?: ReactNode;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onSortingChange?: OnChangeFn<SortingState>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  autoResetPageIndex = false,
  noData = "데이터가 없습니다.",
  className,
  rowCount,
  sorting,
  pagination,
  loading = false,
  manualPagination,
  manualSorting,
  btnGroup,
  onPaginationChange: handlePaginationChange,
  onSortingChange: handleSortingChange,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const options: TableOptions<TData> = {
    data,
    columns,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    autoResetPageIndex,
  };

  const state: Partial<TableState> = {
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
  };

  if (pagination !== undefined) state.pagination = pagination;
  options.state = state;

  if (manualPagination !== undefined) options.manualPagination = manualPagination;
  if (manualSorting !== undefined) options.manualSorting = manualSorting;
  if (rowCount !== undefined) options.rowCount = rowCount;
  if (handlePaginationChange !== undefined) options.onPaginationChange = handlePaginationChange;

  const table = useReactTable(options);

  const isSelectable = useMemo(
    // @ts-expect-error: no type
    () => columns.find(({ accessorKey }) => accessorKey === "select"),
    [columns],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-end gap-2">
        {!!btnGroup && <>{btnGroup}</>}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="">
              표시할 항목 선택
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-(--radix-dropdown-menu-trigger-width)">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => {
                      column.toggleVisibility(!!value);
                    }}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {(column.columnDef?.meta as string) ?? column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-none border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {!header.isPlaceholder &&
                      flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-16 text-center">
                  <LoaderCircle className="m-auto size-8 animate-spin" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => {
                    const size = cell.column.getSize();

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn({ [`w-[${size}px] max-w-[${size}px]`]: Boolean(size) })}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {noData}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        {isSelectable && (
          <div className="flex-1 text-muted-foreground text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        )}
        <div className="flex w-full items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2 text-sm">
            총 {thousandComma(options.rowCount ?? 0)} 행
            {/* <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
          </div>
          <div className="ml-auto flex min-w-25 items-center justify-center font-medium text-sm">
            페이지 {thousandComma(table.getState().pagination.pageIndex + 1)} /{" "}
            {thousandComma(table.getPageCount())}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function tableBodyData(
  value: unknown,
  options: Omit<FieldModel, "name">,
  plain?: boolean,
): React.ReactNode {
  const { type, enums, multiple, comma, file, format = "ymd hms", labelColorMap, refine } = options;

  if (refine && refine instanceof Function) return refine(value, plain);

  if (type === "enum") {
    if (multiple) {
      return (value as string[])
        .map((v) => {
          const [result = v] = Object.entries(enums!).find(([, e]) => v === e) || [];
          return result;
        })
        .join(",");
    } else {
      const [result = value] = Object.entries(enums!).find(([, v]) => v === value) || [];
      return result as string;
    }
  } else if (type === "number" && comma) {
    return thousandComma(value as number);
  } else if (type === "number" && file) {
    return fileSize(value as number);
  } else if (type === "hexstring") {
    const parsed = parseInt(value as string, 16);
    return isNaN(parsed) ? "" : parseInt(value as string, 16);
  } else if (["date", "datetime-local"].includes(type as string)) {
    if (value) return date(value as Date, { type: format as DateFormatType });
  } else if (type === "boolean") {
    if (isNil(value)) return "";

    if (plain) return Boolean(value);
    return !!value ? (
      <SquareCheck className="text-primary" />
    ) : (
      <SquareX className="text-destructive" />
    );
  } else if (type === "checkbox") {
    const checked = isBoolean(value) ? Boolean(value) : Boolean(JSON.parse(value as string));
    if (plain) return checked;
    return <Checkbox className="cursor-default" checked={checked} />;
  } else if (type === "switch") {
    if (isNil(value)) return "";
    const checked = isBoolean(value) ? Boolean(value) : Boolean(JSON.parse(value as string));
    if (plain) return checked;
    return <Switch checked={checked as boolean} />;
  } else if (type === "hex-enum") {
    let resultArr = Object.entries(enums || {}).reduce((acc, [label, bit]) => {
      const hex = parseInt(value as string, 16);
      if (hex & (bit as number)) acc.push(label);
      return acc;
    }, [] as string[]);

    if (resultArr.length === 0) {
      const [label] = Object.entries(enums || {}).find(([, bit]) => bit === value) || [];
      if (label) resultArr = [label as string];
    }

    return plain ? (
      resultArr.map((label) => label).join(", ")
    ) : (
      <div className="flex gap-1">
        {resultArr.map((label) => (
          <Badge
            key={label}
            variant="secondary"
            style={{
              backgroundColor: (labelColorMap as Record<string, string>)?.[label] || "#e5e7eb", // 기본 gray
              color: "#fff",
            }}
          >
            {label}
          </Badge>
        ))}
      </div>
    );
  } else return (value as string) ?? "";
}
