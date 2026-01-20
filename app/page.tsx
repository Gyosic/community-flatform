import { Clock, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getBoards } from "@/lib/data/boards";
import { isInstalled } from "@/lib/data/site-settings";

export default async function Home() {
  // 설치 여부 확인
  const installed = await isInstalled();
  if (!installed) {
    redirect("/setup");
  }

  const boards = await getBoards();
  const session = await getSession();

  // 세션이 있으면 user 객체 생성
  const user = session
    ? {
        id: session.user_id,
        name: session.name,
        role: session.role,
      }
    : null;

  return (
    <MainLayout
      siteName="Community"
      user={user}
      boards={boards}
      showSidebar={true}
      showFooter={true}
    >
      <div className="flex flex-col gap-12">
        {/* 환영 섹션 - 시선 흐름 시작점 */}
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            커뮤니티에 오신 것을 환영합니다
          </h1>
          <p className="text-base text-muted-foreground">
            자유롭게 의견을 나누고 정보를 공유하는 공간입니다.
          </p>
        </section>

        {/* 통계 - 정보 전달 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 게시판</CardTitle>
              <MessageSquare className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{boards.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 게시글</CardTitle>
              <TrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {boards.reduce((sum, b) => sum + b.posts_count, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">오늘 게시글</CardTitle>
              <Clock className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {boards.reduce((sum, b) => sum + b.today_posts_count, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 게시판 목록 - 행동 유도 */}
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold tracking-tight">게시판 목록</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {boards.map((board) => (
              <Link key={board.id} href={`/board/${board.slug}`}>
                <Card className="transition-colors hover:bg-accent cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{board.name}</CardTitle>
                      <Badge
                        variant={
                          board.type === "notice" ? "default" : "secondary"
                        }
                      >
                        {board.type}
                      </Badge>
                    </div>
                    <CardDescription>{board.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>게시글 {board.posts_count}</span>
                      {board.today_posts_count > 0 && (
                        <span className="text-primary font-medium">
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
    </MainLayout>
  );
}
