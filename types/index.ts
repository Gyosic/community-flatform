/**
 * 전역 타입 정의
 */

// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 정렬 타입
export interface SortParams {
  field: string;
  order: "asc" | "desc";
}

// 검색 타입
export interface SearchParams {
  query: string;
  fields?: string[];
}

// 사용자 세션 타입
export interface UserSession {
  id: string;
  email: string;
  name: string;
  role_id: string;
  role_name: string;
  level: number;
  avatar_url?: string;
}

// 게시판 타입
export type BoardType = "general" | "qna" | "gallery" | "notice";

// 게시글 타입
export type PostType = "normal" | "notice" | "pinned";

// 반응 타입
export type ReactionType = "like" | "dislike";

// 권한 관련 타입
export interface UserPermissions {
  canRead: boolean;
  canWrite: boolean;
  canComment: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canPin: boolean;
  canManage: boolean;
}

// 파일 업로드 타입
export interface FileUpload {
  file: File;
  type: string;
  size: number;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  thumbnailUrl?: string;
}
