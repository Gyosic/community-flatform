import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

/**
 * API 응답 유틸리티
 */

// 성공 응답
export const successResponse = <T>(data: T, status = 200): NextResponse<ApiResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  );
};

// 에러 응답
export const errorResponse = (
  code: string,
  message: string,
  status = 400,
  details?: unknown,
): NextResponse<ApiResponse> => {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status },
  );
};

// 에러 코드별 응답
export const badRequestResponse = (
  message = "Bad request",
  details?: unknown,
): NextResponse<ApiResponse> => {
  return errorResponse("BAD_REQUEST", message, 400, details);
};

export const unauthorizedResponse = (message = "Unauthorized"): NextResponse<ApiResponse> => {
  return errorResponse("UNAUTHORIZED", message, 401);
};

export const forbiddenResponse = (message = "Forbidden"): NextResponse<ApiResponse> => {
  return errorResponse("FORBIDDEN", message, 403);
};

export const notFoundResponse = (message = "Not found"): NextResponse<ApiResponse> => {
  return errorResponse("NOT_FOUND", message, 404);
};

export const conflictResponse = (message = "Conflict"): NextResponse<ApiResponse> => {
  return errorResponse("CONFLICT", message, 409);
};

export const validationErrorResponse = (
  message = "Validation error",
  details?: unknown,
): NextResponse<ApiResponse> => {
  return errorResponse("VALIDATION_ERROR", message, 422, details);
};

export const internalServerErrorResponse = (
  message = "Internal server error",
): NextResponse<ApiResponse> => {
  return errorResponse("INTERNAL_SERVER_ERROR", message, 500);
};
