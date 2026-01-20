import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Next.js 미들웨어
 * - 인증 체크
 * - 권한 체크
 * - 요청 로깅
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 요청 로깅 (개발 환경)
  if (process.env.NODE_ENV === "development") {
    console.log(`[${request.method}] ${pathname}`);
  }

  // 정적 파일은 미들웨어 스킵
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/_next") ||
    pathname.includes("/static/")
  ) {
    return NextResponse.next();
  }

  // 관리자 페이지 접근 제어
  if (pathname.startsWith("/admin")) {
    // TODO: 세션 체크 및 관리자 권한 확인
    // 현재는 통과
  }

  return NextResponse.next();
}

// 미들웨어 적용 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
