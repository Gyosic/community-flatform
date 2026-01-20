# 프로젝트 구조

## 디렉토리 구조

```
cafe-service/
├── app/                        # Next.js App Router
│   ├── (auth)/                # 인증 관련 라우트 (로그인, 회원가입)
│   ├── (main)/                # 메인 사이트 라우트
│   ├── admin/                 # 관리자 페이지
│   ├── api/                   # API 라우트
│   │   ├── auth/             # 인증 API
│   │   ├── boards/           # 게시판 API
│   │   ├── posts/            # 게시글 API
│   │   └── users/            # 사용자 API
│   ├── layout.tsx            # 루트 레이아웃
│   └── page.tsx              # 홈페이지
│
├── components/                 # UI 컴포넌트
│   ├── ui/                   # shadcn/ui 기본 컴포넌트
│   ├── layout/               # 레이아웃 컴포넌트 (헤더, 푸터, 사이드바)
│   ├── board/                # 게시판 관련 컴포넌트
│   ├── admin/                # 관리자 페이지 컴포넌트
│   └── common/               # 공통 컴포넌트
│
├── lib/                        # 라이브러리 코드
│   ├── db/                   # 데이터베이스
│   │   ├── schema/           # 데이터베이스 스키마
│   │   │   ├── index.ts
│   │   │   ├── site-settings.ts
│   │   │   ├── users.ts
│   │   │   ├── roles.ts
│   │   │   ├── boards.ts
│   │   │   ├── posts.ts
│   │   │   └── comments.ts
│   │   ├── migrations/       # 마이그레이션 파일
│   │   └── index.ts          # DB 클라이언트
│   │
│   ├── redis/                # Redis 클라이언트
│   │   └── index.ts
│   │
│   ├── auth/                 # 인증 관련
│   │   ├── session.ts
│   │   └── password.ts
│   │
│   ├── utils/                # 유틸리티 함수
│   │   ├── id.ts            # ID 생성
│   │   ├── api-response.ts  # API 응답 헬퍼
│   │   └── validation.ts    # 유효성 검사
│   │
│   ├── hooks/                # React hooks
│   │   ├── use-user.ts
│   │   └── use-settings.ts
│   │
│   └── utils.ts              # shadcn/ui 유틸리티
│
├── types/                      # TypeScript 타입 정의
│   └── index.ts
│
├── public/                     # 정적 파일
│
├── config.ts                   # 환경 설정
├── middleware.ts               # Next.js 미들웨어
├── drizzle.config.ts          # Drizzle ORM 설정
├── .env.example               # 환경변수 예시
└── CLAUDE.md                  # Claude Code 가이드
```

## 주요 파일 설명

### 데이터베이스 스키마

- **site-settings.ts**: 사이트 전역 설정 (레이아웃, 테마, 권한 설정)
- **users.ts**: 사용자 정보 및 프로필
- **roles.ts**: 역할 및 권한 시스템
- **boards.ts**: 게시판 설정 및 구조
- **posts.ts**: 게시글, 첨부파일, 반응
- **comments.ts**: 댓글 및 반응

### 설정 파일

- **config.ts**: 환경변수 기반 설정 (DB, Redis, Auth 등)
- **drizzle.config.ts**: 데이터베이스 마이그레이션 설정
- **.env.example**: 환경변수 템플릿

### 유틸리티

- **lib/utils/id.ts**: 각 엔티티별 ID 생성 함수
- **lib/utils/api-response.ts**: 표준화된 API 응답 헬퍼
- **lib/redis/index.ts**: Redis 캐싱 헬퍼 함수

## 개발 가이드

### 새로운 기능 추가하기

1. **데이터 모델 정의**: `lib/db/schema/`에 스키마 추가
2. **API 엔드포인트**: `app/api/`에 라우트 핸들러 추가
3. **UI 컴포넌트**: `components/`에 컴포넌트 추가
4. **타입 정의**: `types/index.ts`에 타입 추가

### 게시판 기능 추가 예시

```typescript
// 1. app/api/boards/[boardId]/posts/route.ts
import { successResponse } from "@/lib/utils/api-response";

export async function GET(request: Request) {
  // 게시글 목록 조회 로직
  return successResponse(posts);
}

// 2. components/board/post-list.tsx
export function PostList({ boardId }: { boardId: string }) {
  // UI 렌더링
}
```

## 데이터베이스 마이그레이션

```bash
# 마이그레이션 파일 생성
pnpm drizzle-kit generate

# 마이그레이션 실행
pnpm drizzle-kit push
```

## 환경 설정

1. `.env.example`을 복사하여 `.env` 파일 생성
2. 필수 환경변수 설정:
   - DATABASE_URL
   - REDIS_URL
   - SESSION_SECRET
   - JWT_SECRET
