import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { db, writeDb } from "@/lib/db";
import { menu } from "@/lib/db/schema/menu";
import { menuSchema } from "@/lib/zod/menu";

export async function GET() {
  try {
    const rows = await db.select().from(menu).limit(1);

    return NextResponse.json(rows[0]);
  } catch {}
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const menuData = await menuSchema.parseAsync(body);

    const rows = await writeDb.insert(menu).values(menuData).returning();

    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    if (err instanceof ZodError) {
      const [{ message } = {}] = JSON.parse(err?.message || "[]");

      return NextResponse.json(message, { status: 400 });
    }

    return NextResponse.json(err, { status: 500 });
  }
}
export async function PUT() {}
