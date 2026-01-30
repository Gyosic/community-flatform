import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { FileType } from "@/lib/zod/file";

/**
 * 사이트 전역 설정 테이블
 * - 단일 레코드로 운영 (id='default')
 * - JSONB를 활용한 유연한 설정 저장
 */
export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),

  // 기본 정보
  site_name: text("site_name").notNull(),
  site_description: text("site_description").default(""),
  logo: jsonb("logo").$type<FileType[]>(),
  favicon: jsonb("favicon").$type<FileType[]>(),

  // 테마 설정 (JSONB)
  theme_config: jsonb("theme_config").$type<{
    primary_color?: string;
    secondary_color?: string;
    dark_mode: boolean;
    dark_mode_default: "light" | "dark";
  }>(),

  // 권한 설정 (JSONB)
  permission_config: jsonb("permission_config").$type<{
    allow_registration: boolean;
    require_email_verification: boolean;
    default_role: string;
    level_up_posts_count: number;
    level_up_comments_count: number;
    level_up_days_active: number;
  }>(),

  // 기능 토글
  features_config: jsonb("features_config").$type<{
    ai_features?: boolean;
    real_time_notifications: boolean;
    file_upload: boolean;
    anonymous_posts: boolean;
  }>(),

  // SEO 설정
  seo_config: jsonb("seo_config").$type<{
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string[];
    og_image?: FileType[];
  }>(),

  // 타임스탬프
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;
