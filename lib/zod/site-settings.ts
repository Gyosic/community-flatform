import { isNil } from "es-toolkit/compat";
import z from "zod";
import { fileSchema } from "@/lib/zod/file";

export const siteInfoSchema = z.object({
  site_name: z
    .string({
      error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
    })
    .describe(
      JSON.stringify({ name: "사이트 이름", desc: "사이트 헤더와 브라우저 탭에 표시됩니다." }),
    ),
  site_description: z
    .string()
    .optional()
    .describe(
      JSON.stringify({ name: "사이트 설명", desc: "소셜 미디어에서 표시되는 설명입니다." }),
    ),
  logo: z
    .array(z.instanceof(File).or(fileSchema))
    .optional()
    .describe(
      JSON.stringify({
        name: "로고",
        type: "file",
        accept: ["png", "svg"],
        desc: "사이트 헤더에 표시됩니다. 권장크기: 32x32, 파일형식: PNG, SVG",
        unoptimized: true,
      }),
    ),
  favicon: z
    .array(z.instanceof(File).or(fileSchema))
    .optional()
    .describe(
      JSON.stringify({
        name: "파비콘",
        type: "file",
        desc: "브라우저 탭에 표시됩니다. 권장크기: 16x16, 파일형식: ICO(권장), PNG, SVG",
        unoptimized: true,
      }),
    ),
});
export const themeSchema = z.object({
  primary_color: z
    .string()
    .optional()
    .describe(JSON.stringify({ name: "브랜드 컬러", desc: "사이트의 주요 색상을 설정합니다." })),
  secondary_color: z
    .string()
    .optional()
    .describe(JSON.stringify({ name: "보조 컬러", desc: "사이트의 보조 색상을 설정합니다." })),
  default_theme: z.enum(["light", "dark", "system"]).describe(
    JSON.stringify({
      name: "기본 테마",
      enums: { 라이트: "light", 다크: "dark", 시스템: "system" },
      desc: "사이트의 기본 테마를 설정합니다. 시스템 설정 시 사용자 기기의 테마를 따릅니다.",
      default: "system",
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
  require_email_verification: z.boolean().describe(
    JSON.stringify({
      name: "이메일 인증여부",
      desc: "회원가입시 이메일 인증여부를 설정합니다.",
      default: true,
    }),
  ),
  default_role: z.enum(["moderator", "member", "newbie"]).describe(
    JSON.stringify({
      name: "신규회원 초기권한",
      desc: "회원가입시 기본 권한을 설정합니다.",
      enums: { 운영자: "moderator", 정회원: "member", 신규회원: "newbie" },
      default: "newbie",
    }),
  ),
  level_up_posts_count: z
    .number({
      error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
    })
    .describe(
      JSON.stringify({
        name: "레벨 상승 게시글 수",
        desc: "게시글 작성 갯수에 따른 레벨상승 조건을 설정합니다.",
      }),
    ),
  level_up_comments_count: z
    .number({
      error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
    })
    .describe(
      JSON.stringify({
        name: "레벨 상승 댓글 수",
        desc: "댓글 작성 갯수에 따른 레벨상승 조건을 설정합니다.",
      }),
    ),
  level_up_days_active: z
    .number({
      error: (issue) => (isNil(issue.input) ? "필수 입력값 입니다." : "유효하지 않은 값입니다."),
    })
    .describe(
      JSON.stringify({ name: "레벨 상승 출석일", desc: "출석일 따른 레벨상승 조건을 설정합니다." }),
    ),
});

export const featureSchema = z.object({
  ai_features: z
    .boolean()
    .optional()
    .describe(JSON.stringify({ name: "AI 기능", readOnly: true, desc: "추후 업데이트 예정" })),
  real_time_notifications: z
    .boolean()
    .describe(
      JSON.stringify({ name: "실시간 알림", desc: "알림 기능 여부를 설정합니다.", default: false }),
    ),
  file_upload: z.boolean().describe(
    JSON.stringify({
      name: "파일 업로드",
      desc: "파일 업로드 기능 여부를 설정합니다.",
      default: true,
    }),
  ),
  anonymous_posts: z.boolean().describe(
    JSON.stringify({
      name: "익명 게시",
      desc: "글, 댓글 작성시 익명 여부를 설정합니다.",
      default: false,
    }),
  ),
});

export const seoSchema = z.object({
  meta_title: z
    .string()
    .optional()
    .describe(JSON.stringify({ name: "검색엔진 제목", desc: "검색 사이트에 노출되는 제목" })),
  meta_description: z
    .string()
    .optional()
    .describe(JSON.stringify({ name: "검색엔진 설명", desc: "검색 사이트에 노출되는 설명글" })),
  meta_keywords: z
    .array(z.string())
    .optional()
    .describe(
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
        unoptimized: true,
      }),
    ),
});

export const siteSettingSchema = siteInfoSchema.extend({
  theme_config: themeSchema,
  permission_config: permissionSchema,
  features_config: featureSchema,
  seo_config: seoSchema,
});

export type SiteSettingType = z.infer<typeof siteSettingSchema>;

export const configures = [
  {
    schema: siteInfoSchema,
    title: "기본 정보",
    description: "사이트 이름, 설명, 로고를 설정합니다.",
    icon: "BadgeInfo",
  },
  {
    schema: themeSchema,
    title: "테마 설정",
    description: "사이트 색상과 다크모드를 설정합니다.",
    icon: "Palette",
    baseKey: "theme_config",
  },
  {
    schema: permissionSchema,
    title: "권한 설정",
    description: "회원의 권한 등을 설정합니다.",
    icon: "PersonStanding",
    baseKey: "permission_config",
  },
  {
    schema: featureSchema,
    title: "기능 설정",
    description: "각종 기능을 설정합니다.",
    icon: "SquareFunction",
    baseKey: "features_config",
  },
  {
    schema: seoSchema,
    title: "검색엔진 설정",
    description: "구글, 네이버 등 검색 사이트에 노출하는 정보를 설정합니다.",
    icon: "Bot",
    baseKey: "seo_config",
  },
];
