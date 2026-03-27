import { z } from "zod";

/**
 * 게시글 생성 스키마
 */
export const createPostSchema = z.object({
  board_id: z.string().uuid("유효한 게시판을 선택해주세요"),
  title: z.string().min(1, "제목을 입력해주세요").max(200, "제목은 200자 이내로 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  content_html: z.string().optional(),
  type: z.enum(["normal", "notice", "pinned"]).default("normal"),
  is_anonymous: z.boolean().default(false),
  anonymous_name: z.string().max(20).optional(),
  is_pinned: z.boolean().default(false),
});

/**
 * 게시글 수정 스키마
 */
export const updatePostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "제목을 입력해주세요").max(200).optional(),
  content: z.string().min(1, "내용을 입력해주세요").optional(),
  content_html: z.string().optional(),
  type: z.enum(["normal", "notice", "pinned"]).optional(),
  is_pinned: z.boolean().optional(),
  is_locked: z.boolean().optional(),
});

/**
 * 게시글 목록 쿼리 스키마
 */
export const postListQuerySchema = z.object({
  board_id: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(["normal", "notice", "pinned", "all"]).default("all"),
  search: z.string().optional(),
  sort: z.enum(["latest", "popular", "comments"]).default("latest"),
});

/**
 * 게시글 반응 스키마
 */
export const postReactionSchema = z.object({
  post_id: z.string().uuid(),
  type: z.enum(["like", "dislike"]),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostListQuery = z.infer<typeof postListQuerySchema>;
export type PostReactionInput = z.infer<typeof postReactionSchema>;
