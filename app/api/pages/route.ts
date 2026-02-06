import { NextRequest, NextResponse } from "next/server";
import type { ZodError } from "zod";
import { requireAdmin } from "@/lib/api/auth-guard";
import { db, writeDb } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { guid } from "@/lib/randomize";
import { pageSchema } from "@/lib/zod/pages";

export async function GET() {
  const rows = await db.select().from(pages);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await req.json();
    const data = pageSchema.parse(body);

    const slug = `${data.type}/${guid({ length: 11 })}`;

    const [page] = await writeDb
      .insert(pages)
      .values({ ...data, slug })
      .returning();

    return NextResponse.json(page, { status: 201 });
  } catch (err) {
    if (err && typeof err === "object" && "issues" in err) {
      const zodErr = err as ZodError;
      return NextResponse.json(
        { error: zodErr.issues[0]?.message || "유효하지 않은 요청입니다" },
        { status: 400 },
      );
    }
    console.error("Failed to create page:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
