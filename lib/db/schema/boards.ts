import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * 게시판 테이블
 */
export const boards = pgTable("boards", {
  id: uuid("id").defaultRandom().primaryKey(),

  // 기본 정보
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),

  // 게시판 타입
  type: text("type").notNull().default("general"), // general, qna, gallery, notice

  // 부모 게시판 (계층 구조 지원)
  parent_id: uuid("parent_id"),

  // 정렬 순서
  sort_order: integer("sort_order").notNull().default(0),

  // 게시판 설정 (JSONB)
  board_config: jsonb("board_config").$type<{
    allow_anonymous: boolean; // 익명 게시 허용
    allow_comments: boolean; // 댓글 허용
    allow_nested_comments: boolean; // 대댓글 허용
    allow_attachments: boolean; // 첨부파일 허용
    max_attachment_size: number; // MB 단위
    allowed_file_types: string[]; // ['image/*', 'application/pdf']
    require_approval: boolean; // 게시글 승인 필요
    auto_delete_days?: number; // 자동 삭제 일수
  }>(),

  // 표시 설정
  display_config: jsonb("display_config").$type<{
    posts_per_page: number;
    show_author: boolean;
    show_view_count: boolean;
    show_like_count: boolean;
    card_layout: "list" | "grid" | "compact";
    thumbnail_size: "small" | "medium" | "large";
  }>(),

  // 통계
  posts_count: integer("posts_count").notNull().default(0),
  today_posts_count: integer("today_posts_count").notNull().default(0),

  // 타임스탬프
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
