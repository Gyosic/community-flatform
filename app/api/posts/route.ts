import { and, asc, desc, eq, getTableColumns } from "drizzle-orm";
import { isNil } from "es-toolkit/compat";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { parseQuery } from "@/lib/api/parse-query";
import { db } from "@/lib/db";
import { pages, posts, users } from "@/lib/db/schema";

const postColumns = getTableColumns(posts);
const userColumns = getTableColumns(users);
const pageColumns = getTableColumns(pages);

type PostColumn = keyof typeof postColumns;

const schema = z.object({
  sorts: z.string().optional(),
  from: z.coerce.number().optional(),
  size: z.coerce.number().optional(),
  board_type: z.string().optional(),
  title: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { sorts, from, size, board_type, title } = parseQuery(req, schema);

    const where = [];
    if (board_type) where.push(eq(pages.type, board_type));
    if (title) where.push(eq(posts.title, title));

    let query = db
      .select({ ...postColumns, user: userColumns, page: pageColumns })
      .from(posts)
      .innerJoin(pages, eq(pages.id, posts.page_id))
      .innerJoin(users, eq(users.id, posts.author_id))
      .where(and(...where))
      .$dynamic();

    if (sorts) {
      // name:asc,create_at:desc
      const sort = (sorts as string).split(",").map((s) => {
        const [key, order] = s.split(":");

        if (order === "desc") return desc(posts[key as PostColumn]);
        else return asc(posts[key as PostColumn]);
      });
      query = query.orderBy(...sort);
    }

    if (!isNil(size) && !isNil(from)) {
      query = query.limit(size as number).offset(from as number);
    }

    const rows = await query;

    return NextResponse.json(rows);
  } catch (err) {
    console.info(err);
    return NextResponse.json(err);
  }
}
