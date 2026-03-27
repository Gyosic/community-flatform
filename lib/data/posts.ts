import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, writeDb } from "@/lib/db";
import { boards, postReactions, posts, users } from "@/lib/db/schema";
import type { CreatePostInput, PostListQuery, UpdatePostInput } from "@/lib/zod/posts";

export async function getPosts(query: PostListQuery) {
  const { board_id, page, limit, type, search, sort } = query;
  const offset = (page - 1) * limit;

  const conditions = [eq(posts.is_deleted, false), eq(posts.is_published, true)];

  if (board_id) {
    conditions.push(eq(posts.board_id, board_id));
  }

  if (type && type !== "all") {
    conditions.push(eq(posts.type, type));
  }

  if (search) {
    conditions.push(or(ilike(posts.title, `%${search}%`), ilike(posts.content, `%${search}%`))!);
  }

  const orderBy =
    sort === "popular"
      ? [desc(posts.like_count), desc(posts.created_at)]
      : sort === "comments"
        ? [desc(posts.comment_count), desc(posts.created_at)]
        : [desc(posts.is_pinned), desc(posts.created_at)];

  const [postList, countResult] = await Promise.all([
    db
      .select({
        id: posts.id,
        board_id: posts.board_id,
        title: posts.title,
        content: posts.content,
        type: posts.type,
        is_anonymous: posts.is_anonymous,
        anonymous_name: posts.anonymous_name,
        view_count: posts.view_count,
        like_count: posts.like_count,
        dislike_count: posts.dislike_count,
        comment_count: posts.comment_count,
        is_pinned: posts.is_pinned,
        is_locked: posts.is_locked,
        created_at: posts.created_at,
        updated_at: posts.updated_at,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.author_id, users.id))
      .where(and(...conditions))
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(and(...conditions)),
  ]);

  return {
    posts: postList,
    pagination: {
      page,
      limit,
      total: countResult[0]?.count ?? 0,
      totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
    },
  };
}

export async function getPostById(id: string) {
  const result = await db
    .select({
      id: posts.id,
      board_id: posts.board_id,
      title: posts.title,
      content: posts.content,
      content_html: posts.content_html,
      type: posts.type,
      is_anonymous: posts.is_anonymous,
      anonymous_name: posts.anonymous_name,
      view_count: posts.view_count,
      like_count: posts.like_count,
      dislike_count: posts.dislike_count,
      comment_count: posts.comment_count,
      is_pinned: posts.is_pinned,
      is_locked: posts.is_locked,
      is_published: posts.is_published,
      created_at: posts.created_at,
      updated_at: posts.updated_at,
      author_id: posts.author_id,
      author: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
      board: {
        id: boards.id,
        name: boards.name,
        slug: boards.slug,
        board_config: boards.board_config,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.author_id, users.id))
    .leftJoin(boards, eq(posts.board_id, boards.id))
    .where(and(eq(posts.id, id), eq(posts.is_deleted, false)))
    .limit(1);

  return result[0] || null;
}

export async function createPost(input: CreatePostInput, authorId: string | null) {
  const result = await writeDb
    .insert(posts)
    .values({
      ...input,
      author_id: input.is_anonymous ? null : authorId,
    })
    .returning();

  if (result[0]) {
    await writeDb
      .update(boards)
      .set({
        posts_count: sql`${boards.posts_count} + 1`,
        today_posts_count: sql`${boards.today_posts_count} + 1`,
      })
      .where(eq(boards.id, input.board_id));
  }

  return result[0];
}

export async function updatePost(input: UpdatePostInput, userId: string) {
  const { id, ...data } = input;

  const existing = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!existing[0]) return null;
  if (existing[0].author_id !== userId) return null;

  const result = await writeDb
    .update(posts)
    .set({ ...data, updated_at: new Date() })
    .where(eq(posts.id, id))
    .returning();

  return result[0];
}

export async function deletePost(id: string, userId: string, isAdmin: boolean = false) {
  const existing = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!existing[0]) return false;
  if (!isAdmin && existing[0].author_id !== userId) return false;

  await writeDb
    .update(posts)
    .set({ is_deleted: true, deleted_at: new Date() })
    .where(eq(posts.id, id));

  await writeDb
    .update(boards)
    .set({ posts_count: sql`GREATEST(${boards.posts_count} - 1, 0)` })
    .where(eq(boards.id, existing[0].board_id));

  return true;
}

export async function incrementViewCount(id: string) {
  await writeDb
    .update(posts)
    .set({ view_count: sql`${posts.view_count} + 1` })
    .where(eq(posts.id, id));
}

export async function togglePostReaction(postId: string, userId: string, type: "like" | "dislike") {
  const existing = await db
    .select()
    .from(postReactions)
    .where(and(eq(postReactions.post_id, postId), eq(postReactions.user_id, userId)))
    .limit(1);

  if (existing[0]) {
    if (existing[0].type === type) {
      await writeDb.delete(postReactions).where(eq(postReactions.id, existing[0].id));

      const countField = type === "like" ? posts.like_count : posts.dislike_count;
      await writeDb
        .update(posts)
        .set({
          [type === "like" ? "like_count" : "dislike_count"]: sql`GREATEST(${countField} - 1, 0)`,
        })
        .where(eq(posts.id, postId));

      return { action: "removed", type };
    } else {
      await writeDb.update(postReactions).set({ type }).where(eq(postReactions.id, existing[0].id));

      const oldType = existing[0].type;
      await writeDb
        .update(posts)
        .set({
          like_count:
            type === "like"
              ? sql`${posts.like_count} + 1`
              : sql`GREATEST(${posts.like_count} - 1, 0)`,
          dislike_count:
            type === "dislike"
              ? sql`${posts.dislike_count} + 1`
              : sql`GREATEST(${posts.dislike_count} - 1, 0)`,
        })
        .where(eq(posts.id, postId));

      return { action: "changed", from: oldType, to: type };
    }
  } else {
    await writeDb.insert(postReactions).values({
      post_id: postId,
      user_id: userId,
      type,
    });

    await writeDb
      .update(posts)
      .set({
        [type === "like" ? "like_count" : "dislike_count"]:
          type === "like" ? sql`${posts.like_count} + 1` : sql`${posts.dislike_count} + 1`,
      })
      .where(eq(posts.id, postId));

    return { action: "added", type };
  }
}

export async function getUserReaction(postId: string, userId: string) {
  const result = await db
    .select()
    .from(postReactions)
    .where(and(eq(postReactions.post_id, postId), eq(postReactions.user_id, userId)))
    .limit(1);

  return result[0]?.type || null;
}
