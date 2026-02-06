import { z } from "zod";

/**
 * 게시판 설정 스키마
 */
export const pageConfigSchema = z.object({
  allow_anonymous: z.boolean().describe(JSON.stringify({ name: "익명 게시 허용", default: false })),
  allow_comments: z.boolean().describe(JSON.stringify({ name: "댓글 허용", default: true })),
  allow_nested_comments: z
    .boolean()
    .describe(JSON.stringify({ name: "대댓글 허용", default: true })),
  allow_attachments: z.boolean().describe(JSON.stringify({ name: "첨부파일 허용", default: true })),
  max_attachment_size: z
    .number()
    .min(1)
    .max(100)
    .describe(JSON.stringify({ name: "MB 단위", default: 10, placeholder: "1 ~ 100 MB" })),
  allowed_file_types: z.array(z.enum(["image", "pdf", "zip", "mp4"])).describe(
    JSON.stringify({
      name: "허용 확장자",
      type: "enum",
      enums: { 이미지: "image", PDF: "pdf", ZIP: "zip", MP4: "mp4" },
      multiple: true,
      default: ["image"],
    }),
  ),
  require_approval: z
    .boolean()
    .describe(JSON.stringify({ name: "게시글 승인 필요", default: false })),
});

/**
 * 게시판 표시 설정 스키마
 */
export const pageDisplayConfigSchema = z.object({
  show_author: z.boolean().describe(JSON.stringify({ name: "작성자 보임", default: true })),
  show_view_count: z.boolean().describe(JSON.stringify({ name: "조회수 보임", default: true })),
  show_like_count: z.boolean().describe(JSON.stringify({ name: "좋아요 수 보임", default: true })),
});

/**
 * 페이지 레이아웃
 */
export const pageLayoutSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  component: z.object({ id: z.string(), props: z.record(z.string(), z.unknown()) }).optional(),
});

/**
 * 게시판 생성 스키마
 * slug는 서버에서 type 기반으로 자동 생성됨
 */
export const pageSchema = z.object({
  name: z.string({ error: () => "필수입력값 입니다." }).describe(
    JSON.stringify({
      name: "페이지명",
    }),
  ),
  type: z
    .enum(["general", "free", "qna", "gallery", "notice", "discussion", "suggestion", "rule"], {
      error: () => "유효하지 않은 입력값 입니다.",
    })
    .describe(
      JSON.stringify({
        name: "게시판 유형",
        enums: {
          일반: "general",
          자유게시판: "free",
          "Q&A": "qna",
          갤러리: "gallery",
          공지: "notice",
          토론: "discussion",
          건의사항: "suggestion",
          "규칙/가이드": "rule",
        },
      }),
    ),
  description: z
    .string()
    .max(500)
    .optional()
    .describe(
      JSON.stringify({
        name: "설명",
        type: "textarea",
        placeholder: "자유롭게 이야기를 나누는 공간입니다. (최대 500자)",
      }),
    ),
  parent_id: z.string().optional().nullable(),
  config: pageConfigSchema.optional(),
  display_config: pageDisplayConfigSchema.optional(),
  layout: z.array(pageLayoutSchema),
});

/**
 * 게시판 수정 스키마
 */
export const updatePageSchema = pageSchema.partial().extend({
  id: z.string(),
});

export type PageConfigSchema = z.infer<typeof pageConfigSchema>;
export type PageDisplayConfigSchema = z.infer<typeof pageDisplayConfigSchema>;
export type PageSchema = z.infer<typeof pageSchema>;
export type UpdatePageSchema = z.infer<typeof updatePageSchema>;
