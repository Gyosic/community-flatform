import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * 역할 테이블
 * - 시스템관리자, 관리자, 운영진, 일반회원, 신규회원
 */
export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),

  // 역할 정보
  name: text("name").notNull().unique(),
  display_name: text("display_name").notNull(),
  description: text("description"),

  // 레벨 범위 (이 역할에 도달하기 위한 레벨)
  min_level: integer("min_level").notNull().default(1),
  max_level: integer("max_level"),

  // 우선순위 (숫자가 높을수록 높은 권한)
  priority: integer("priority").notNull().default(0),

  // 색상 및 스타일
  color: text("color"),
  badge_config: jsonb("badge_config").$type<{
    icon?: string;
    background_color?: string;
    text_color?: string;
  }>(),

  // 타임스탬프
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * 권한 테이블
 * - 역할별 권한을 정의
 */
export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),

  role_id: uuid("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),

  // 게시판 권한 (null이면 모든 게시판에 적용)
  board_id: uuid("board_id"),

  // 권한 설정
  can_read: integer("can_read").notNull().default(1), // 0: 불가, 1: 가능
  can_write: integer("can_write").notNull().default(0),
  can_comment: integer("can_comment").notNull().default(0),
  can_delete: integer("can_delete").notNull().default(0),
  can_edit: integer("can_edit").notNull().default(0),
  can_pin: integer("can_pin").notNull().default(0), // 공지 고정
  can_manage: integer("can_manage").notNull().default(0), // 게시판 관리

  // 타임스탬프
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
