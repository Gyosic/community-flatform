# 설치 가이드

## 1. 의존성 설치

```bash
pnpm install
```

## 2. 환경변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 값을 설정합니다.

```bash
cp .env.example .env
```

필수 환경변수:
- `DATABASE_URL` 또는 개별 DB 설정 (HOST, PORT, USER, PASSWORD, NAME)
- `REDIS_URL` 또는 개별 Redis 설정
- `SESSION_SECRET` (랜덤한 문자열로 변경)
- `JWT_SECRET` (랜덤한 문자열로 변경)

## 3. 데이터베이스 마이그레이션

```bash
# 마이그레이션 파일 생성 및 자동 실행
pnpm db:generate
```

이 명령어는:
1. `drizzle-kit generate` - 마이그레이션 파일 생성
2. `drizzle-kit push` - 데이터베이스에 마이그레이션 적용

## 4. 초기 데이터 생성

```bash
pnpm db:seed
```

이 명령어는 다음을 생성합니다:
- 기본 역할 4개 (관리자, 운영진, 일반회원, 신규회원)
- 각 역할별 권한 설정
- 사이트 기본 설정
- 관리자 계정
- 샘플 게시판 4개 (공지사항, 자유게시판, Q&A, 갤러리)

### 기본 관리자 계정

- **이메일**: admin@example.com
- **비밀번호**: admin123!

⚠️ **프로덕션 환경에서는 반드시 비밀번호를 변경하세요!**

## 5. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 데이터베이스 관리

### Drizzle Studio 실행

데이터베이스를 시각적으로 관리할 수 있는 Drizzle Studio를 실행합니다:

```bash
pnpm db:studio
```

브라우저에서 `https://local.drizzle.studio`를 엽니다.

### 데이터베이스 초기화

데이터베이스를 완전히 초기화하려면:

```bash
# 1. 모든 테이블 삭제 (PostgreSQL)
psql -U username -d cafe_service -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 2. 마이그레이션 다시 실행
pnpm db:generate

# 3. 초기 데이터 생성
pnpm db:seed
```

## 트러블슈팅

### 데이터베이스 연결 오류

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

PostgreSQL이 실행 중인지 확인하세요:

```bash
# macOS (Homebrew)
brew services start postgresql

# Linux (systemd)
sudo systemctl start postgresql

# Docker
docker-compose up -d postgres
```

### Redis 연결 오류

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

Redis가 실행 중인지 확인하세요:

```bash
# macOS (Homebrew)
brew services start redis

# Linux (systemd)
sudo systemctl start redis

# Docker
docker-compose up -d redis
```

### 마이그레이션 충돌

마이그레이션 파일이 충돌하는 경우:

1. `drizzle/` 디렉토리 삭제
2. `pnpm db:generate` 다시 실행

### bcrypt 설치 오류

네이티브 모듈 빌드 오류가 발생하는 경우:

```bash
# macOS
xcode-select --install

# Ubuntu/Debian
sudo apt-get install build-essential python3

# Windows
npm install --global windows-build-tools
```

그 후 다시 설치:

```bash
pnpm install
```
