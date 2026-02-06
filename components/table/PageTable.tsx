"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { Column, PaginationState, Row, SortingState } from "@tanstack/table-core";
import { get } from "es-toolkit/compat";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  EllipsisVertical,
  ListPlus,
  Pencil,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, tableBodyData } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Page } from "@/lib/db/schema/pages";
import { alert } from "@/lib/store/alert";
import { fieldModelBuilder } from "@/lib/zod";
import { PageSchema, pageSchema } from "@/lib/zod/pages";

const { fieldModel: pageFieldModel } = fieldModelBuilder({
  schema: pageSchema.pick({ name: true, type: true }),
});

export interface PageTableProps {
  noData?: React.ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
  manualPagination?: boolean;
  manualSorting?: boolean;
}

export function PageTable({
  noData,
  className,
  manualPagination = true,
  manualSorting = true,
}: PageTableProps) {
  const router = useRouter();
  const isMobile = useIsMobile();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [paginationVar, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const pagination = useMemo(
    () => ({ pageIndex: paginationVar.pageIndex, pageSize: isMobile ? 5 : 15 }),
    [paginationVar, isMobile],
  );

  const columns: Array<ColumnDef<Page>> = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      maxSize: 100,
    },
    {
      accessorKey: "no",
      enableHiding: false,
      header: () => <div className="text-center">No.</div>,
      cell: (info) => {
        return (
          <div className="text-center">
            {info.table.getState().pagination.pageIndex *
              info.table.getState().pagination.pageSize +
              info.row.index +
              1}
          </div>
        );
      },
      maxSize: 100,
    },
    ...Object.entries(pageFieldModel ?? {}).map(([key, model]) => {
      return {
        id: key,
        accessorFn: (row) => get(row, key),
        meta: model.name,
        header: ({ column }: { column: Column<Page> }) => {
          const sortBtn = () => {
            if (column.getIsSorted() === "asc") return <ArrowUp className="ml-2 h-4 w-4" />;
            else if (column.getIsSorted() === "desc") return <ArrowDown className="ml-2 h-4 w-4" />;
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
          };

          return (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                {model.name}
                {sortBtn()}
              </Button>
            </div>
          );
        },
        cell: ({ getValue }) => {
          return <div className="flex justify-center">{tableBodyData(getValue(), model)}</div>;
        },
      } as ColumnDef<Page>;
    }),
    {
      accessorKey: "id",
      enableHiding: false,
      header: "",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Button type="button" variant="ghost" size="icon" onClick={() => handleUpdate(row)}>
              <Pencil />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => handleDelete(row)}>
              <Trash className="text-destructive" />
            </Button>
            {/* <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleUpdate(row)}>
                  <Pencil />
                  변경
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(row)}>
                  <Trash />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        );
      },
      maxSize: 100,
    },
  ];

  const handleUpdate = (row: Row<Page>) => {};
  const handleDelete = async (row: Row<Page>) => {
    alert.confirm({
      title: "페이지 삭제",
      message: "정말 삭제하시겠습니까?",
      onConfirm: async () => {
        const res = await fetch(`/api/pages/${row.original.id}`, {
          method: "DELETE",
        });
        if (!res.ok) toast.error("[페이지]", { description: "삭제 실패" });
        toast.success("[페이지]", { description: "삭제 완료" });
        getPages();
      },
    });
  };

  const getPages = useCallback(async () => {
    // const { searchKeyword, templateId, ...params } = filter;
    // const query: FilterBody = { must: [], should: [] };
    // Object.entries(params).map(([key, value]) => {
    //   if (value) query.must!.push({ field: key, operator: "eq", value } as never);
    // });
    // if (searchKeyword) {
    //   Object.assign(query, {
    //     should: [
    //       ...(query.should ?? []),
    //       { field: "name", operator: "like", value: searchKeyword },
    //     ],
    //   });
    // }
    // if (templateId) {
    //   Object.assign(query, {
    //     must: [...(query.must ?? []), { field: "templateId", operator: "eq", value: templateId }],
    //   });
    // }
    // if (sorting) {
    //   Object.assign(query, {
    //     sort: sorting.map(({ id, desc }) => ({ field: id, order: desc ? "desc" : "asc" })),
    //   });
    // }
    // // const { from: _from, size: _size, ...excelQuery } = query;
    // // setExcelFilter(excelQuery);
    // if (pagination)
    //   Object.assign(query, {
    //     from: pagination.pageIndex * pagination.pageSize,
    //     size: pagination.pageSize,
    //   });
    // setLoading(true);
    const response = await fetch(`/api/pages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      setRows([]);
      setTotal(0);
      setLoading(false);
    }
    const rows = await response.json();
    setRows(rows);
    // setTotal(total);
    setLoading(false);
  }, [sorting, pagination]);

  useEffect(() => {
    getPages();
  }, [getPages]);

  return (
    <div className="flex flex-col gap-2">
      <DataTable
        data={rows}
        className={className}
        loading={loading}
        rowCount={total}
        pagination={pagination}
        sorting={sorting}
        manualPagination={manualPagination}
        manualSorting={manualSorting}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        columns={columns}
        noData={noData}
        btnGroup={
          <Button variant="outline" onClick={() => router.push(`/system/pages/setting`)}>
            <ListPlus />
            페이지 추가
          </Button>
        }
      />
    </div>
  );
}
