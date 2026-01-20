import { pgTable, text, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";

/**
 * 사이트 전역 설정 테이블
 * - 단일 레코드로 운영 (id='default')
 * - JSONB를 활용한 유연한 설정 저장
 */
export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),

  // 기본 정보
  site_name: text("site_name").notNull().default("My Community"),
  site_description: text("site_description"),
  site_url: text("site_url"),
  logo_url: text("logo_url"),
  favicon_url: text("favicon_url"),

  // 레이아웃 설정 (JSONB)
  layout_config: jsonb("layout_config").$type<{
    header_visible: boolean;
    footer_visible: boolean;
    sidebar_position: "left" | "right" | "none";
    navigation_style: "top" | "side";
    home_layout: string[]; // 홈페이지 블록 순서
  }>(),

  // 테마 설정 (JSONB)
  theme_config: jsonb("theme_config").$type<{
    primary_color: string;
    secondary_color: string;
    dark_mode: boolean;
    dark_mode_default: boolean;
    button_style: "rounded" | "square" | "pill";
    font_size: "small" | "medium" | "large";
  }>(),

  // 권한 설정 (JSONB)
  permission_config: jsonb("permission_config").$type<{
    allow_registration: boolean;
    require_email_verification: boolean;
    default_role: string;
    level_up_criteria: {
      posts_count?: number;
      comments_count?: number;
      days_active?: number;
    };
  }>(),

  // 기능 토글
  features_enabled: jsonb("features_enabled").$type<{
    ai_features: boolean;
    real_time_notifications: boolean;
    file_upload: boolean;
    anonymous_posts: boolean;
  }>(),

  // SEO 설정
  seo_config: jsonb("seo_config").$type<{
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string[];
    og_image?: string;
  }>(),

  // 타임스탬프
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;
