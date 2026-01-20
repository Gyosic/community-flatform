import { pgTable, text, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { users } from "./users";

/**
 * 댓글 테이블
 */
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),

  // 게시글
  post_id: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),

  // 작성자 (익명일 경우 null 가능)
  author_id: uuid("author_id").references(() => users.id, {
    onDelete: "set null",
  }),

  // 부모 댓글 (대댓글인 경우)
  parent_id: uuid("parent_id"),

  // 익명 설정
  is_anonymous: boolean("is_anonymous").notNull().default(false),
  anonymous_name: text("anonymous_name"),

  // 내용
  content: text("content").notNull(),
  content_html: text("content_html"),

  // 통계
  like_count: integer("like_count").notNull().default(0),
  dislike_count: integer("dislike_count").notNull().default(0),

  // 상태
  is_deleted: boolean("is_deleted").notNull().default(false),

  // 타임스탬프
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  deleted_at: timestamp("deleted_at"),
});

/**
 * 댓글 좋아요/싫어요 테이블
 */
export const commentReactions = pgTable("comment_reactions", {
  id: uuid("id").defaultRandom().primaryKey(),

  comment_id: uuid("comment_id")
    .notNull()
    .references(() => comments.id, { onDelete: "cascade" }),

  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // 반응 타입
  type: text("type").notNull(), // like, dislike

  // 타임스탬프
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type CommentReaction = typeof commentReactions.$inferSelect;
export type NewCommentReaction = typeof commentReactions.$inferInsert;
