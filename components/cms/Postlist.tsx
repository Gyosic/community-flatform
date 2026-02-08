"use client";

import { Column, ColumnDef, PaginationState, SortingState } from "@tanstack/table-core";
import { get } from "es-toolkit/compat";
import { List, Pencil, Search, TableProperties } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import z from "zod";
import Combobox from "@/components/shared/Combobox";
import { DataTable, tableBodyData } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { fieldModelBuilder } from "@/lib/zod";
import { BoardType } from "@/types";

type PostType = {
  board_type: BoardType;
  title: string;
  user_name: string;
  created_at: string;
  view_count: number;
  like_count: number;
};
const postSchema = z.object({
  board_type: z.string().describe(JSON.stringify({ name: "게시판 유형" })),
  title: z.string().describe(JSON.stringify({ name: "제목" })),
  user_name: z.string().describe(JSON.stringify({ name: "작성자" })),
  created_at: z.string().describe(JSON.stringify({ name: "날짜" })),
  view_count: z.number().describe(JSON.stringify({ name: "조회수" })),
  like_count: z.number().describe(JSON.stringify({ name: "좋아요" })),
});
const { fieldModel } = fieldModelBuilder({ schema: postSchema });

interface PostlistProps {
  noData?: React.ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
  manualPagination?: boolean;
  manualSorting?: boolean;
  boardType: BoardType;
  session?: Session | null;
}

export function Postlist({
  noData,
  className,
  manualPagination,
  manualSorting,
  boardType,
  session,
}: PostlistProps) {
  // const router = useRouter();
  const isMobile = useIsMobile();
  const basepath = "/api/posts";

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [mode, setMode] = useState("list");
  const searchList = [
    { label: "제목", value: "title" },
    { label: "작성자", value: "user_name" },
  ];
  const [search, setSearch] = useState("title");
  const [inputValue, setInputValue] = useState("");
  const filter = useMemo(() => {
    return { [search]: inputValue };
  }, [search, inputValue]);

  const [paginationVar, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 });
  const pagination = useMemo(
    () => ({ pageIndex: paginationVar.pageIndex, pageSize: isMobile ? 5 : 15 }),
    [paginationVar, isMobile],
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: Array<ColumnDef<PostType>> = [
    ...Object.entries(fieldModel ?? {}).map(([key, model]) => {
      return {
        id: key,
        accessorFn: (row) => get(row, key),
        meta: model.name,
        header: ({ column }: { column: Column<PostType> }) => {
          return <div className="text-center">{model.name}</div>;
        },
        cell: ({ getValue }) => {
          return <div className="flex justify-center">{tableBodyData(getValue(), model)}</div>;
        },
      } as ColumnDef<PostType>;
    }),
  ];

  const getPages = async () => {
    const params = { board_type: boardType, ...filter };
    const query = new URLSearchParams(params).toString();

    const response = await fetch(`${basepath}?${query}`);

    if (!response.ok) {
      setRows([]);
      setTotal(0);
      setLoading(false);
    }
    const rows = await response.json();

    setRows(rows);
    // setTotal(total);
    setLoading(false);
  };

  useEffect(() => {
    getPages();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-end gap-1">
        <div className="mr-2 flex items-center gap-1">
          <Combobox
            value={search}
            items={searchList}
            onValueChange={(v) => setSearch(v as string)}
          />
          <Input
            placeholder="입력하세요"
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") getPages();
            }}
          />
          <Button type="button" variant="outline" onClick={() => getPages()}>
            <Search />
          </Button>
        </div>
        {!!session && (
          <Button type="button">
            <Pencil />
          </Button>
        )}
        <Button
          className={mode === "simple" ? "border-2" : ""}
          type="button"
          variant="outline"
          onClick={() => setMode("simple")}
        >
          <TableProperties />
        </Button>
        <Button
          type="button"
          className={mode === "list" ? "border-2" : ""}
          variant="outline"
          onClick={() => setMode("list")}
        >
          <List />
        </Button>
      </div>
      {mode === "simple" && <ItemList items={rows} noData={noData} />}
      {mode === "list" && (
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
          enableColumnVisibility={false}
        />
      )}
    </div>
  );
}

import { Session } from "next-auth";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

type Item = {
  title: string;
  user_name: string;
  thumnail: string | File;
  created_at: string;
};
interface ItemListProps {
  items: Item[];
  noData?: React.ReactNode;
}
const ItemList = ({ items, noData = "데이터가 없습니다." }: ItemListProps) => (
  <div className="mt-2 flex w-full flex-col gap-6 border">
    {items.length ? (
      <ItemGroup className="gap-4">
        {items.map((item) => (
          <Item asChild className="bg-background" key={item.title} variant="outline">
            <a href="#">
              <ItemMedia variant="image">
                <img
                  alt={item.title}
                  className="object-cover grayscale"
                  height={32}
                  src="https://placehold.co/32x32"
                  width={32}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">{item.title}</ItemTitle>
                <ItemDescription>{item.user_name}</ItemDescription>
              </ItemContent>
              <ItemContent className="flex-none text-center">
                <ItemDescription>{item.created_at}</ItemDescription>
              </ItemContent>
            </a>
          </Item>
        ))}
      </ItemGroup>
    ) : (
      <div className="flex h-20 items-center justify-center">{noData}</div>
    )}
  </div>
);
