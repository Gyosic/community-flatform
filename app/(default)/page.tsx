import { Postlist } from "@/components/cms/Postlist";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  return (
    <div className="flex flex-col gap-12">
      {/* 환영 섹션 - 시선 흐름 시작점 */}
      <section className="flex flex-col gap-4">
        <h1 className="font-bold text-3xl tracking-tight">커뮤니티에 오신 것을 환영합니다</h1>
        <p className="text-base text-muted-foreground">
          자유롭게 의견을 나누고 정보를 공유하는 공간입니다.
        </p>
      </section>

      <Postlist boardType="free" noData="게시글이 없습니다." session={session} />
    </div>
  );
}
