import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { roles } from "./roles";

/**
 * 사용자 테이블
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  // 기본 정보
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: timestamp("emailVerified"),
  password: text("password").notNull(),

  // 프로필
  image: text("image"),
  bio: text("bio"),
  profile_config: jsonb("profile_config").$type<{
    custom_fields?: Record<string, string>;
    social_links?: {
      twitter?: string;
      github?: string;
      website?: string;
    };
  }>(),

  // 역할 및 레벨
  role_id: uuid("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "restrict" }),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),

  // 통계
  posts_count: integer("posts_count").notNull().default(0),
  comments_count: integer("comments_count").notNull().default(0),

  // 계정 상태
  is_active: boolean("is_active").notNull().default(true),
  is_email_verified: boolean("is_email_verified").notNull().default(false),
  is_banned: boolean("is_banned").notNull().default(false),
  banned_until: timestamp("banned_until"),
  banned_reason: text("banned_reason"),

  // 마지막 활동
  last_login_at: timestamp("last_login_at"),
  last_active_at: timestamp("last_active_at"),

  // 타임스탬프
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text().$type<AdapterAccountType>().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refresh_token: text(),
    access_token: text(),
    expires_at: integer(),
    token_type: text(),
    scope: text(),
    id_token: text(),
    session_state: text(),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
