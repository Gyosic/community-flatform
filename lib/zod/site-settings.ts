import z from "zod";

export const siteInfoSchema = z.object({
  site_name: z.string().describe(JSON.stringify({ name: "사이트 이름" })),
  site_description: z.string().describe(JSON.stringify({ name: "사이트 설명" })),
  logo_url: z.string().describe(JSON.stringify({ name: "사이트 로고" })),
  favicon_url: z.string().describe(JSON.stringify({ name: "사이트 파비콘" })),
});
export const themeSchema = z.object({
  primary_color: z.string().describe(JSON.stringify({ name: "브랜드 컬러" })),
  secondary_color: z.string().describe(JSON.stringify({ name: "보조 컬러" })),
  dark_mode: z.boolean().describe(JSON.stringify({ name: "다크모드 지원" })),
  dark_mode_default: z.enum(["light", "dark"]).describe(JSON.stringify({ name: "기본 모드" })),
});

export const permissionSchema = z.object({
  allow_registration: z.boolean().describe(JSON.stringify({ name: "회원가입 허용" })),
  require_email_verification: z.boolean().describe(JSON.stringify({ name: "이메일 인증여부" })),
  default_role: z
    .enum(["moderator", "member", "newbie"])
    .describe(JSON.stringify({ name: "신규회원 초기권한" })),
  level_up_posts_count: z.number().describe(JSON.stringify({ name: "레벨 상승 게시글 수" })),
  level_up_comments_count: z.number().describe(JSON.stringify({ name: "레벨 상승 댓글 수" })),
  level_up_days_active: z.number().describe(JSON.stringify({ name: "레벨 상승 출석일" })),
});

export const featureSchema = z.object({
  ai_features: z.boolean().describe(JSON.stringify({ name: "AI 기능" })),
  real_time_notifications: z.boolean().describe(JSON.stringify({ name: "실시간 알림" })),
  file_upload: z.boolean().describe(JSON.stringify({ name: "파일 업로드" })),
  anonymous_posts: z.boolean().describe(JSON.stringify({ name: "익명 게시" })),
});

export const seoSchema = z.object({
  meta_title: z.string().describe(JSON.stringify({ name: "검색엔진 제목" })),
  meta_description: z.string().describe(JSON.stringify({ name: "검색엔진 설명" })),
  meta_keywords: z.array(z.string()).describe(JSON.stringify({ name: "검색 키워드" })),
  og_image: z.string().describe(JSON.stringify({ name: "소셜 공유 이미지" })),
});

export const siteSettingSchema = z.object({
  ...siteInfoSchema,
  theme_config: themeSchema,
  permission_config: permissionSchema,
  features_enabled: featureSchema,
  seo_config: seoSchema,
});
