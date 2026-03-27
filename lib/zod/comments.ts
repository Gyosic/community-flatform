import { z } from "zod";

/**
 * 댓글 생성 스키마
 */
export const createCommentSchema = z.object({
  post_id: z.string().uuid("유효한 게시글을 선택해주세요"),
  parent_id: z.string().uuid().optional().nullable(),
  content: z.string().min(1, "댓글을 입력해주세요").max(2000, "댓글은 2000자 이내로 입력해주세요"),
  content_html: z.string().optional(),
  is_anonymous: z.boolean().default(false),
  anonymous_name: z.string().max(20).optional(),
});

/**
 * 댓글 수정 스키마
 */
export const updateCommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, "댓글을 입력해주세요").max(2000).optional(),
  content_html: z.string().optional(),
});

/**
 * 댓글 목록 쿼리 스키마
 */
export const commentListQuerySchema = z.object({
  post_id: z.string().uuid(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.enum(["oldest", "newest", "popular"]).default("oldest"),
});

/**
 * 댓글 반응 스키마
 */
export const commentReactionSchema = z.object({
  comment_id: z.string().uuid(),
  type: z.enum(["like", "dislike"]),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CommentListQuery = z.infer<typeof commentListQuerySchema>;
export type CommentReactionInput = z.infer<typeof commentReactionSchema>;
