import { config } from "dotenv";

// .env 파일 로드
config();

/**
 * 환경변수 타입 검증 및 기본값 설정
 */
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  // defaultValue가 제공되지 않았고 (undefined) value도 없으면 에러
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || "";
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? Number(value) : defaultValue;
};

const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value === "true" || value === "1";
};

// PostgreSQL 설정
export const postgresql = {
  host: getEnv("DATABASE_HOST", "localhost"),
  port: Number(getEnvNumber("DATABASE_PORT", 5432)),
  user: decodeURIComponent(getEnv("DATABASE_USER", "postgres")),
  password: process.env.DATABASE_PASSWORD
    ? decodeURIComponent(process.env.DATABASE_PASSWORD)
    : undefined,
  database: getEnv("DATABASE_NAME", "cafe_service"),
  ssl: false,
};

// Redis 설정
export const redis = {
  url: getEnv("REDIS_URL", "redis://localhost:6379"),
  host: getEnv("REDIS_HOST", "localhost"),
  port: getEnvNumber("REDIS_PORT", 6379),
  password: process.env.REDIS_PASSWORD,
};

// 애플리케이션 설정
export const app = {
  env: getEnv("NODE_ENV", "development"),
  port: getEnvNumber("PORT", 3000),
  baseurl: getEnv("BASEURL", "http://localhost:3000"),
};

export const sysadmin = {
  email: getEnv("SYSADMIN_EMAIL", "admin@example.com"),
  name: getEnv("SYSADMIN_NAME", "admin"),
  password: getEnv("SYSADMIN_PASSWORD", "admin123!"),
};

// 파일 업로드 설정
export const upload = {
  maxFileSize: getEnvNumber("MAX_FILE_SIZE", 10485760), // 10MB
  uploadDir: getEnv("UPLOAD_DIR", "./uploads"),
  allowedFileTypes: getEnv("ALLOWED_FILE_TYPES", "image/*,application/pdf").split(","),
};

// AI 기능 설정
export const ai = {
  enabled: getEnvBoolean("AI_ENABLED", false),
  openaiApiKey: process.env.OPENAI_API_KEY,
};

export type PostgresqlType = typeof postgresql;
export type RedisType = typeof redis;
export type AppType = typeof app;
export type Sysadmin = typeof sysadmin;
export type UploadType = typeof upload;
export type AiType = typeof ai;
