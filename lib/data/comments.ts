import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { db, writeDb } from "@/lib/db";
import { commentReactions, comments, posts, users } from "@/lib/db/schema";
import type { CommentListQuery, CreateCommentInput, UpdateCommentInput } from "@/lib/zod/comments";

export async function getComments(query: CommentListQuery) {
  const { post_id, page, limit, sort } = query;
  const offset = (page - 1) * limit;

  const orderBy =
    sort === "newest"
      ? [desc(comments.created_at)]
      : sort === "popular"
        ? [desc(comments.like_count), asc(comments.created_at)]
        : [asc(comments.created_at)];

  const [commentList, countResult] = await Promise.all([
    db
      .select({
        id: comments.id,
        post_id: comments.post_id,
        parent_id: comments.parent_id,
        content: comments.content,
        content_html: comments.content_html,
        is_anonymous: comments.is_anonymous,
        anonymous_name: comments.anonymous_name,
        like_count: comments.like_count,
        dislike_count: comments.dislike_count,
        is_deleted: comments.is_deleted,
        created_at: comments.created_at,
        updated_at: comments.updated_at,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.author_id, users.id))
      .where(and(eq(comments.post_id, post_id), isNull(comments.parent_id)))
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(comments)
      .where(and(eq(comments.post_id, post_id), isNull(comments.parent_id))),
  ]);

  const parentIds = commentList.map((c) => c.id);
  let replies: typeof commentList = [];

  if (parentIds.length > 0) {
    replies = await db
      .select({
        id: comments.id,
        post_id: comments.post_id,
        parent_id: comments.parent_id,
        content: comments.content,
        content_html: comments.content_html,
        is_anonymous: comments.is_anonymous,
        anonymous_name: comments.anonymous_name,
        like_count: comments.like_count,
        dislike_count: comments.dislike_count,
        is_deleted: comments.is_deleted,
        created_at: comments.created_at,
        updated_at: comments.updated_at,
        author: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.author_id, users.id))
      .where(and(eq(comments.post_id, post_id), sql`${comments.parent_id} = ANY(${parentIds})`))
      .orderBy(asc(comments.created_at));
  }

  const commentsWithReplies = commentList.map((comment) => ({
    ...comment,
    replies: replies.filter((r) => r.parent_id === comment.id),
  }));

  return {
    comments: commentsWithReplies,
    pagination: {
      page,
      limit,
      total: countResult[0]?.count ?? 0,
      totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
    },
  };
}

export async function getCommentById(id: string) {
  const result = await db
    .select({
      id: comments.id,
      post_id: comments.post_id,
      parent_id: comments.parent_id,
      author_id: comments.author_id,
      content: comments.content,
      content_html: comments.content_html,
      is_anonymous: comments.is_anonymous,
      anonymous_name: comments.anonymous_name,
      like_count: comments.like_count,
      dislike_count: comments.dislike_count,
      is_deleted: comments.is_deleted,
      created_at: comments.created_at,
      updated_at: comments.updated_at,
    })
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createComment(input: CreateCommentInput, authorId: string | null) {
  const result = await writeDb
    .insert(comments)
    .values({
      ...input,
      author_id: input.is_anonymous ? null : authorId,
    })
    .returning();

  if (result[0]) {
    await writeDb
      .update(posts)
      .set({
        comment_count: sql`${posts.comment_count} + 1`,
        last_comment_at: new Date(),
      })
      .where(eq(posts.id, input.post_id));
  }

  return result[0];
}

export async function updateComment(input: UpdateCommentInput, userId: string) {
  const { id, ...data } = input;

  const existing = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  if (!existing[0]) return null;
  if (existing[0].author_id !== userId) return null;

  const result = await writeDb
    .update(comments)
    .set({ ...data, updated_at: new Date() })
    .where(eq(comments.id, id))
    .returning();

  return result[0];
}

export async function deleteComment(id: string, userId: string, isAdmin: boolean = false) {
  const existing = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  if (!existing[0]) return false;
  if (!isAdmin && existing[0].author_id !== userId) return false;

  await writeDb
    .update(comments)
    .set({ is_deleted: true, deleted_at: new Date(), content: "삭제된 댓글입니다." })
    .where(eq(comments.id, id));

  await writeDb
    .update(posts)
    .set({ comment_count: sql`GREATEST(${posts.comment_count} - 1, 0)` })
    .where(eq(posts.id, existing[0].post_id));

  return true;
}

export async function toggleCommentReaction(
  commentId: string,
  userId: string,
  type: "like" | "dislike",
) {
  const existing = await db
    .select()
    .from(commentReactions)
    .where(and(eq(commentReactions.comment_id, commentId), eq(commentReactions.user_id, userId)))
    .limit(1);

  if (existing[0]) {
    if (existing[0].type === type) {
      await writeDb.delete(commentReactions).where(eq(commentReactions.id, existing[0].id));

      const countField = type === "like" ? comments.like_count : comments.dislike_count;
      await writeDb
        .update(comments)
        .set({
          [type === "like" ? "like_count" : "dislike_count"]: sql`GREATEST(${countField} - 1, 0)`,
        })
        .where(eq(comments.id, commentId));

      return { action: "removed", type };
    } else {
      await writeDb
        .update(commentReactions)
        .set({ type })
        .where(eq(commentReactions.id, existing[0].id));

      await writeDb
        .update(comments)
        .set({
          like_count:
            type === "like"
              ? sql`${comments.like_count} + 1`
              : sql`GREATEST(${comments.like_count} - 1, 0)`,
          dislike_count:
            type === "dislike"
              ? sql`${comments.dislike_count} + 1`
              : sql`GREATEST(${comments.dislike_count} - 1, 0)`,
        })
        .where(eq(comments.id, commentId));

      return { action: "changed", from: existing[0].type, to: type };
    }
  } else {
    await writeDb.insert(commentReactions).values({
      comment_id: commentId,
      user_id: userId,
      type,
    });

    await writeDb
      .update(comments)
      .set({
        [type === "like" ? "like_count" : "dislike_count"]:
          type === "like" ? sql`${comments.like_count} + 1` : sql`${comments.dislike_count} + 1`,
      })
      .where(eq(comments.id, commentId));

    return { action: "added", type };
  }
}

export async function getUserCommentReaction(commentId: string, userId: string) {
  const result = await db
    .select()
    .from(commentReactions)
    .where(and(eq(commentReactions.comment_id, commentId), eq(commentReactions.user_id, userId)))
    .limit(1);

  return result[0]?.type || null;
}
