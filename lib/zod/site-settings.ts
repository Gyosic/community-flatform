import z from "zod";
import { fileSchema } from "@/lib/zod/file";

export const siteInfoSchema = z.object({
  site_name: z
    .string()
    .describe(
      JSON.stringify({ name: "사이트 이름", desc: "사이트 헤더와 브라우저 탭에 표시됩니다." }),
    ),
  site_description: z
    .string()
    .describe(
      JSON.stringify({ name: "사이트 설명", desc: "소셜 미디어에서 표시되는 설명입니다." }),
    ),
  logo_url: z
    .array(z.instanceof(File).or(fileSchema))
    .optional()
    .describe(
      JSON.stringify({
        name: "로고",
        type: "file",
        accept: ["png", "svg"],
        desc: "사이트 헤더에 표시됩니다. 권장크기: 32x32, 파일형식: PNG, SVG",
      }),
    ),
  favicon_url: z
    .array(z.instanceof(File).or(fileSchema))
    .optional()
    .describe(
      JSON.stringify({
        name: "파비콘",
        type: "file",
        desc: "브라우저 탭에 표시됩니다. 권장크기: 16x16, 파일형식: ICO(권장), PNG, SVG",
      }),
    ),
});
export const themeSchema = z.object({
  primary_color: z
    .string()
    .describe(JSON.stringify({ name: "브랜드 컬러", desc: "사이트의 주요 색상을 설정합니다." })),
  secondary_color: z
    .string()
    .describe(JSON.stringify({ name: "보조 컬러", desc: "사이트의 보조 색상을 설정합니다." })),
  dark_mode: z
    .boolean()
    .describe(
      JSON.stringify({ name: "다크모드 지원", desc: "다크모드를 지원 여부를 설정합니다." }),
    ),
  dark_mode_default: z.enum(["light", "dark"]).describe(
    JSON.stringify({
      name: "기본 테마",
      enums: { 기본모드: "light", 다크모드: "dark" },
      desc: "기본 테마를 설정합니다. 다크모드를 지원하지 않을 경우 기본모드만 가능합니다.",
      default: "light",
    }),
  ),
});

export const permissionSchema = z.object({
  allow_registration: z.boolean().describe(
    JSON.stringify({
      name: "회원가입 허용",
      default: true,
      desc: "새로운 회원의 가입을 허용합니다.",
    }),
  ),
  require_email_verification: z
    .boolean()
    .describe(
      JSON.stringify({ name: "이메일 인증여부", desc: "회원가입시 이메일 인증여부를 설정합니다." }),
    ),
  default_role: z.enum(["moderator", "member", "newbie"]).describe(
    JSON.stringify({
      name: "신규회원 초기권한",
      desc: "회원가입시 기본 권한을 설정합니다.",
      enums: { 운영자: "moderator", 정회원: "member", 신규회원: "newbie" },
      default: "newbie",
    }),
  ),
  level_up_posts_count: z.number().describe(
    JSON.stringify({
      name: "레벨 상승 게시글 수",
      desc: "게시글 작성 갯수에 따른 레벨상승 조건을 설정합니다.",
    }),
  ),
  level_up_comments_count: z.number().describe(
    JSON.stringify({
      name: "레벨 상승 댓글 수",
      desc: "댓글 작성 갯수에 따른 레벨상승 조건을 설정합니다.",
    }),
  ),
  level_up_days_active: z
    .number()
    .describe(
      JSON.stringify({ name: "레벨 상승 출석일", desc: "출석일 따른 레벨상승 조건을 설정합니다." }),
    ),
});

export const featureSchema = z.object({
  ai_features: z
    .boolean()
    .describe(JSON.stringify({ name: "AI 기능", readOnly: true, desc: "추후 업데이트 예정" })),
  real_time_notifications: z
    .boolean()
    .describe(JSON.stringify({ name: "실시간 알림", desc: "알림 기능 여부를 설정합니다." })),
  file_upload: z.boolean().describe(
    JSON.stringify({
      name: "파일 업로드",
      desc: "파일 업로드 기능 여부를 설정합니다.",
      default: true,
    }),
  ),
  anonymous_posts: z
    .boolean()
    .describe(
      JSON.stringify({ name: "익명 게시", desc: "글, 댓글 작성시 익명 여부를 설정합니다." }),
    ),
});

export const seoSchema = z.object({
  meta_title: z
    .string()
    .describe(JSON.stringify({ name: "검색엔진 제목", desc: "검색 사이트에 노출되는 제목" })),
  meta_description: z
    .string()
    .describe(JSON.stringify({ name: "검색엔진 설명", desc: "검색 사이트에 노출되는 설명글" })),
  meta_keywords: z.array(z.string()).describe(
    JSON.stringify({
      name: "검색 키워드",
      type: "tag",
      placeholder: "입력 후 엔터 또는 추가 버튼 클릭하세요.",
      desc: "검색 사이트에 노출되는 키워드",
    }),
  ),
  og_image: z
    .array(z.instanceof(File).or(fileSchema))
    .optional()
    .describe(
      JSON.stringify({
        name: "소셜 공유 이미지",
        type: "file",
        desc: "링크 공유 시 표시되는 이미지. 파일형식: PNG, JPG, JPEG",
        accept: ["png", "jpg", "jpeg"],
      }),
    ),
});

export const siteSettingSchema = z.object({
  ...siteInfoSchema,
  theme_config: themeSchema,
  permission_config: permissionSchema,
  features_enabled: featureSchema,
  seo_config: seoSchema,
});
