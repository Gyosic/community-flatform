import { db } from "@/lib/db";
import { boards } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * 모든 게시판 목록 가져오기
 */
export async function getBoards() {
  try {
    const result = await db
      .select()
      .from(boards)
      .orderBy(boards.sort_order, boards.created_at);

    return result;
  } catch (error) {
    console.error("Failed to fetch boards:", error);
    return [];
  }
}

/**
 * 게시판 slug로 단일 게시판 가져오기
 */
export async function getBoardBySlug(slug: string) {
  try {
    const result = await db
      .select()
      .from(boards)
      .where(eq(boards.slug, slug))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Failed to fetch board:", error);
    return null;
  }
}
