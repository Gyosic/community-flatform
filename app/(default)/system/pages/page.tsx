"use client";

import {
  FileText,
  LayoutGrid,
  List,
  MessageCircle,
  MessageSquareWarning,
  Paperclip,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageTable } from "@/components/table/PageTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Page } from "@/lib/db/schema/pages";
import { alert } from "@/lib/store/alert";
import { cn } from "@/lib/utils";

const pageTypeLabels: Record<string, string> = {
  general: "일반",
  free: "자유게시판",
  qna: "Q&A",
  gallery: "갤러리",
  notice: "공지",
  discussion: "토론",
  suggestion: "건의사항",
  rule: "규칙/가이드",
};

const pageTypeColors: Record<string, string> = {
  general: "bg-slate-500",
  free: "bg-blue-500",
  qna: "bg-purple-500",
  gallery: "bg-pink-500",
  notice: "bg-red-500",
  discussion: "bg-amber-500",
  suggestion: "bg-green-500",
  rule: "bg-cyan-500",
};

export default function AdminPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/pages");
      const data = await res.json();
      setPages(data);
    } catch {
      toast.error("게시판 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreate = () => {
    router.push("/system/pages/setting");
  };

  const handleEdit = (page: Page) => {
    router.push(`/system/pages/setting?id=${page.id}`);
  };

  const handleDelete = (page: Page) => {
    alert.confirm({
      title: (
        <div className="flex items-center gap-2">
          <MessageSquareWarning className="text-destructive" />
          페이지 삭제
        </div>
      ),
      message: (
        <div className="flex flex-col gap-1">
          <span className="font-medium">&quot;{page.name}&quot; 페이지를 삭제하시겠습니까?</span>
          <span className="text-muted-foreground text-sm">
            모든 게시글이 함께 삭제되며, 이 작업은 되돌릴 수 없습니다.
          </span>
        </div>
      ),
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/pages/${page.id}`, { method: "DELETE" });
          if (res.ok) {
            await fetchPages();
            toast.success("페이지가 삭제되었습니다.");
          } else {
            toast.error("삭제에 실패했습니다.");
          }
        } catch {
          toast.error("삭제 중 오류가 발생했습니다.");
        }
      },
    });
  };

  const totalPosts = pages.reduce((sum, page) => sum + (page.posts_count || 0), 0);
  const todayPosts = pages.reduce((sum, page) => sum + (page.today_posts_count || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">페이지 관리</h1>
          <p className="text-muted-foreground">커뮤니티의 페이지를 생성하고 관리합니다.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 size-4" />
          페이지 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>전체 페이지</CardDescription>
            <CardTitle className="text-3xl">{pages.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>전체 게시글</CardDescription>
            <CardTitle className="text-3xl">{totalPosts.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>오늘 작성된 게시글</CardDescription>
            <CardTitle className="text-3xl text-primary">+{todayPosts.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{pages.length}개의 페이지</span>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as "grid" | "list")}
        >
          <ToggleGroupItem value="grid" aria-label="그리드 보기">
            <LayoutGrid className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="리스트 보기">
            <List className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {loading ? (
        <div
          className={cn(
            "grid gap-4",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
          )}
        >
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pages.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FileText className="mb-4 size-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">페이지가 없습니다</h3>
            <p className="mb-4 text-muted-foreground text-sm">
              첫 번째 페이지를 만들어 커뮤니티를 시작하세요.
            </p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 size-4" />
              페이지 추가
            </Button>
          </CardContent>
        </Card>
      ) : (
        // <div
        //   className={cn(
        //     "grid gap-4",
        //     viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
        //   )}
        // >
        //   {pages.map((page) => (
        //     <Card key={page.id} className="group transition-shadow hover:shadow-md">
        //       <CardHeader className="pb-3">
        //         <div className="flex items-start justify-between">
        //           <div className="flex items-center gap-2">
        //             <div
        //               className={cn(
        //                 "size-3 rounded-full",
        //                 pageTypeColors[page.type] || "bg-gray-500",
        //               )}
        //             />
        //             <CardTitle className="text-lg">{page.name}</CardTitle>
        //           </div>
        //           <Badge variant="secondary">{pageTypeLabels[page.type] || page.type}</Badge>
        //         </div>
        //         {page.description && (
        //           <CardDescription className="line-clamp-2">{page.description}</CardDescription>
        //         )}
        //       </CardHeader>

        //       <CardContent className="pb-3">
        //         <div className="mb-3 flex items-center gap-4 text-sm">
        //           <div className="flex items-center gap-1 text-muted-foreground">
        //             <FileText className="size-4" />
        //             <span>{page.posts_count || 0}개 게시글</span>
        //           </div>
        //           {page.today_posts_count > 0 && (
        //             <span className="font-medium text-primary text-xs">
        //               +{page.today_posts_count} 오늘
        //             </span>
        //           )}
        //         </div>

        //         <div className="flex flex-wrap gap-1.5">
        //           {page.config?.allow_anonymous && (
        //             <Badge variant="outline" className="gap-1 text-xs">
        //               <User className="size-3" />
        //               익명
        //             </Badge>
        //           )}
        //           {page.config?.allow_comments && (
        //             <Badge variant="outline" className="gap-1 text-xs">
        //               <MessageCircle className="size-3" />
        //               댓글
        //             </Badge>
        //           )}
        //           {page.config?.allow_attachments && (
        //             <Badge variant="outline" className="gap-1 text-xs">
        //               <Paperclip className="size-3" />
        //               첨부
        //             </Badge>
        //           )}
        //         </div>
        //       </CardContent>

        //       <Separator />

        //       <CardFooter className="justify-end gap-2 pt-3">
        //         <Button variant="ghost" size="sm" onClick={() => handleEdit(page)}>
        //           <Pencil className="mr-1 size-4" />
        //           수정
        //         </Button>
        //         <Button
        //           variant="ghost"
        //           size="sm"
        //           className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        //           onClick={() => handleDelete(page)}
        //         >
        //           <Trash2 className="mr-1 size-4" />
        //           삭제
        //         </Button>
        //       </CardFooter>
        //     </Card>
        //   ))}
        // </div>
        <PageTable />
      )}
    </div>
  );
}
