# CLAUDE.md

Claude Code가 이 저장소에서 작업할 때 참고하는 지침입니다.

## 프로젝트 개요

**셀프 호스팅 커뮤니티 플랫폼** - 네이버 카페와 유사한 커뮤니티 소프트웨어. 관리자가 코드 수정 없이 설정만으로 커스터마이징 가능.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **DB**: PostgreSQL + Drizzle ORM
- **Cache**: Redis
- **Auth**: NextAuth v5
- **State**: Zustand

## 핵심 원칙

1. **설정 기반 설계**: 모든 기능은 하드코딩이 아닌 DB/환경변수 설정으로 제어
2. **수정이 아닌 확장**: JSONB 활용, 컴포지션 패턴
3. **RBAC 권한**: Role + Permission 시스템, 게시판별 권한

## 금지 패턴

- 하드코딩된 커뮤니티명/URL
- `as any`, `@ts-ignore`, `@ts-expect-error`
- 빈 catch 블록 `catch(e) {}`
- 설정 없이 동작하는 UI 컴포넌트
- Grid/Flex 혼용 (페이지 단위로 통일)
- Tailwind arbitrary value

## 필수 패턴

- 설정 기반 UI 렌더링
- 모든 데이터 접근 시 권한 체크
- 색상은 CSS 변수 (primary, secondary, danger, muted)
- shadcn 컴포넌트 기본 유지

## 개발 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run db:generate  # DB 마이그레이션
npm run db:studio    # Drizzle Studio
```

## 참고 문서

- `docs/PLANNING.md` - 기능 요구사항 및 로드맵
- `docs/STYLE_GUIDE.md` - 디자인 시스템 가이드
- `docs/PROJECT_STRUCTURE.md` - 프로젝트 구조
- `docs/SETUP.md` - 설치 가이드
