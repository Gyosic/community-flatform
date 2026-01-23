import { Clock, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBoards } from "@/lib/data/boards";

export default async function Home() {
  const boards = await getBoards();

  return (
    <div className="flex flex-col gap-12">
      {/* 환영 섹션 - 시선 흐름 시작점 */}
      <section className="flex flex-col gap-4">
        <h1 className="font-bold text-3xl tracking-tight">커뮤니티에 오신 것을 환영합니다</h1>
        <p className="text-base text-muted-foreground">
          자유롭게 의견을 나누고 정보를 공유하는 공간입니다.
        </p>
      </section>

      {/* 통계 - 정보 전달 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">총 게시판</CardTitle>
            <MessageSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{boards.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">총 게시글</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {boards.reduce((sum, b) => sum + b.posts_count, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">오늘 게시글</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {boards.reduce((sum, b) => sum + b.today_posts_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 게시판 목록 - 행동 유도 */}
      <section className="flex flex-col gap-6">
        <h2 className="font-semibold text-xl tracking-tight">게시판 목록</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {boards.map((board) => (
            <Link key={board.id} href={`/board/${board.slug}`}>
              <Card className="cursor-pointer transition-colors hover:bg-accent">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{board.name}</CardTitle>
                    <Badge variant={board.type === "notice" ? "default" : "secondary"}>
                      {board.type}
                    </Badge>
                  </div>
                  <CardDescription>{board.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <span>게시글 {board.posts_count}</span>
                    {board.today_posts_count > 0 && (
                      <span className="font-medium text-primary">
                        오늘 +{board.today_posts_count}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
