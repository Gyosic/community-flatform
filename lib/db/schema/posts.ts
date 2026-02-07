import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { FileType } from "@/lib/zod/file";
import { pages } from "./pages";
import { users } from "./users";

/**
 * 게시글 테이블
 */
export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),

  // 게시판
  page_id: uuid("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),

  // 작성자 (익명일 경우 null 가능)
  author_id: uuid("author_id").references(() => users.id, {
    onDelete: "set null",
  }),

  // 익명 설정
  is_anonymous: boolean("is_anonymous").notNull().default(false),

  // 내용
  title: text("title").notNull(),
  content: text("content").notNull(),
  content_html: text("content_html"), // 렌더링된 HTML

  // 통계
  view_count: integer("view_count").notNull().default(0),
  like_count: integer("like_count").notNull().default(0),
  dislike_count: integer("dislike_count").notNull().default(0),
  comment_count: integer("comment_count").notNull().default(0),

  // 상태
  is_published: boolean("is_published").notNull().default(true),
  is_pinned: boolean("is_pinned").notNull().default(false),
  is_locked: boolean("is_locked").notNull().default(false), // 댓글 잠금
  is_deleted: boolean("is_deleted").notNull().default(false),

  // 승인 상태
  needs_approval: boolean("needs_approval").notNull().default(false),
  approved_at: timestamp("approved_at"),
  approved_by: uuid("approved_by"),

  // 마지막 댓글 (정렬용)
  last_comment_at: timestamp("last_comment_at"),

  // 타임스탬프
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * 게시글 첨부파일 테이블
 */
export const postAttachments = pgTable("post_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),

  post_id: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),

  // 파일 정보
  files: jsonb("files").$type<FileType[]>(),

  // 이미지 메타데이터 (이미지인 경우)
  width: integer("width"),
  height: integer("height"),
  thumbnail_url: text("thumbnail_url"),

  // 다운로드 통계
  download_count: integer("download_count").notNull().default(0),

  // 타임스탬프
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostAttachment = typeof postAttachments.$inferSelect;
export type NewPostAttachment = typeof postAttachments.$inferInsert;
