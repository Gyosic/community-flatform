import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * 페이지 테이블
 */
export const pages = pgTable("pages", {
  id: uuid("id").defaultRandom().primaryKey(),

  // 기본 정보
  slug: text("slug").notNull().unique(),
  description: text("description"),
  name: text("name").notNull(),
  // 게시판 타입
  type: text("type").notNull().default("general"), //["general", "free", "qna", "gallery", "notice", "discussion", "suggestion", "rule"]
  // 부모 게시판 (계층 구조 지원)
  parent_id: uuid("parent_id"),

  // 게시판 설정 (JSONB)
  config: jsonb("config").$type<{
    allow_anonymous: boolean; // 익명 게시 허용
    allow_comments: boolean; // 댓글 허용
    allow_nested_comments: boolean; // 대댓글 허용
    allow_attachments: boolean; // 첨부파일 허용
    max_attachment_size: number; // MB 단위
    allowed_file_types: string[]; // ['image/*', 'application/pdf']
    require_approval: boolean; // 게시글 승인 필요
  }>(),

  // 표시 설정
  display_config: jsonb("display_config").$type<{
    show_author: boolean;
    show_view_count: boolean;
    show_like_count: boolean;
  }>(),

  // 레이아웃
  layout:
    jsonb("layout").$type<
      {
        i: string;
        x: number;
        y: number;
        w: number;
        h: number;
        component?: {
          id: string;
          props: Record<string, unknown>;
        };
      }[]
    >(),

  // 통계
  posts_count: integer("posts_count").notNull().default(0),
  today_posts_count: integer("today_posts_count").notNull().default(0),

  // 타임스탬프
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
