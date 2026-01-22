# Cafe Service

**셀프 호스팅 커뮤니티 플랫폼** - WordPress나 Discourse처럼 설치 후 관리자가 자유롭게 커스터마이징할 수 있는 네이버 카페 스타일 커뮤니티 소프트웨어

## 주요 특징

- 설정 기반 설계: 코드 수정 없이 UI/기능 제어
- 유연한 게시판 시스템: 일반, Q&A, 갤러리, 공지 타입 지원
- 세분화된 권한 관리: 역할별, 게시판별 권한 설정
- 커스터마이징: 테마, 레이아웃, 메뉴 자유 설정
- 익명 게시 지원
- 플러그인 시스템 (향후 추가)

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **데이터베이스**: PostgreSQL + Drizzle ORM
- **캐시**: Redis (ioredis)
- **언어**: TypeScript
- **패키지 관리**: npm

## 시작하기

### 1. 환경 설정

```bash
# .env 파일 생성
cp .env.example .env

# 환경변수 설정 (.env 파일 편집)
# - DATABASE_URL
# - REDIS_URL
# - SESSION_SECRET
# - JWT_SECRET
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 데이터베이스 설정

```bash
# PostgreSQL 및 Redis 실행 (Docker 사용 예시)
docker-compose up -d

# 데이터베이스 마이그레이션
npx drizzle-kit generate
npx drizzle-kit push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
cafe-service/
├── app/              # Next.js App Router (페이지, API)
├── components/       # UI 컴포넌트
├── lib/             # 라이브러리 (db, redis, utils)
├── types/           # TypeScript 타입 정의
├── config.ts        # 환경 설정
└── middleware.ts    # Next.js 미들웨어
```

자세한 구조는 [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)를 참고하세요.

## 개발 가이드

프로젝트의 아키텍처 원칙과 개발 가이드라인은 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

### 주요 명령어

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm run start

# 코드 검사
npm run lint

# 코드 포맷팅
npm run format

# 데이터베이스 마이그레이션 생성
npx drizzle-kit generate

# 데이터베이스 마이그레이션 실행
npx drizzle-kit push
```

## 배포

### Docker (권장)

```bash
# Docker 이미지 빌드
docker build -t cafe-service .

# 컨테이너 실행
docker run -p 3000:3000 --env-file .env cafe-service
```

### 전통적 배포

1. 프로젝트 빌드: `npm run build`
2. 환경변수 설정
3. PM2 또는 systemd로 실행: `npm run start`

## 라이선스

MIT

## 🤝 기여하기

### 📋 커밋 규칙

[Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다.

| Type       | 의미                  | 예시                                  |
| ---------- | --------------------- | ------------------------------------- |
| `feat`     | 새로운 기능 추가      | `feat(auth): add OAuth login`         |
| `fix`      | 버그 수정             | `fix(ui): button color issue`         |
| `docs`     | 문서 수정             | `docs: update README`                 |
| `style`    | 코드 포맷/스타일 변경 | `style: format code`                  |
| `refactor` | 코드 리팩토링         | `refactor: optimize database queries` |
| `perf`     | 성능 개선             | `perf: optimize image loading`        |
| `test`     | 테스트 관련           | `test: add unit tests`                |
| `chore`    | 빌드/패키지 매니저    | `chore: update dependencies`          |

### 🔄 기여 프로세스

1. **Fork the Project**
2. **Add Remote Upstream**
   ```bash
   git remote add upstream https://github.com/Gyosic/portfolio.git
   ```
3. **Create Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
4. **Commit Changes**
   ```bash
   git commit -m 'feat: add AmazingFeature'
   ```
5. **Push to Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
6. **Open Pull Request**

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.
