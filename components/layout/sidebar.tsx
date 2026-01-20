"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Image, HelpCircle, Bell, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Board {
  id: string;
  name: string;
  slug: string;
  type: string;
  posts_count: number;
  today_posts_count: number;
}

interface SidebarProps {
  boards?: Board[];
  isOpen?: boolean;
  onClose?: () => void;
}

const getIconForBoardType = (type: string) => {
  switch (type) {
    case "notice":
      return Bell;
    case "gallery":
      return Image;
    case "qna":
      return HelpCircle;
    default:
      return MessageSquare;
  }
};

export function Sidebar({ boards = [], isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform md:sticky md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* 모바일 헤더 */}
          <div className="flex items-center justify-between p-4 border-b md:hidden">
            <span className="font-semibold">메뉴</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>

          {/* 내비게이션 */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/"
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <Home className="size-4" />
                <span>홈</span>
              </Link>

              <Link
                href="/trending"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/trending"
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <TrendingUp className="size-4" />
                <span>인기 글</span>
              </Link>
            </div>

            {/* 게시판 목록 */}
            {boards.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  게시판
                </h3>
                <div className="flex flex-col gap-1">
                  {boards.map((board) => {
                    const Icon = getIconForBoardType(board.type);
                    const isActive = pathname === `/board/${board.slug}`;

                    return (
                      <Link
                        key={board.id}
                        href={`/board/${board.slug}`}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-secondary text-secondary-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="size-4" />
                          <span>{board.name}</span>
                        </div>
                        {board.today_posts_count > 0 && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                            {board.today_posts_count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* 통계 */}
          <div className="border-t p-4">
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <p>총 게시글: {boards.reduce((sum, b) => sum + b.posts_count, 0)}</p>
              <p>오늘 게시글: {boards.reduce((sum, b) => sum + b.today_posts_count, 0)}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
