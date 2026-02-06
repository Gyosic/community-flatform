import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import type { ZodError } from "zod";
import { requireAdmin } from "@/lib/api/auth-guard";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { updatePageSchema } from "@/lib/zod/pages";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const [board] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

  if (!board) {
    return NextResponse.json({ error: "게시판을 찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json(board);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const authResult = await requireAdmin();
  if (!authResult.authorized) return authResult.response;

  const { id } = await context.params;

  try {
    const body = await req.json();
    const data = updatePageSchema.parse({ ...body, id });
    console.info(data);

    return NextResponse.json({});
  } catch (err) {
    if (err && typeof err === "object" && "issues" in err) {
      const zodErr = err as ZodError;
      return NextResponse.json(
        { error: zodErr.issues[0]?.message || "유효하지 않은 요청입니다" },
        { status: 400 },
      );
    }
    console.error("Failed to update board:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const authResult = await requireAdmin();
  if (!authResult.authorized) return authResult.response;

  const { id } = await context.params;

  try {
    await db.delete(pages).where(eq(pages.id, id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
