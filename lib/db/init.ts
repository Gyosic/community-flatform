import { eq } from "drizzle-orm";
import { sysadmin } from "@/config";
import { hashPassword } from "@/lib/auth/password";
import { getRoleByName, initializeRoles, ROLE_NAMES, systemAdminExists } from "@/lib/auth/roles";
import { db, writeDb } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";

/**
 * 데이터베이스 초기화
 * - 역할 초기화
 * - 시스템 관리자 계정 생성 (환경변수 기반)
 */
export async function initializeDatabase() {
  try {
    // 1. 역할 테이블 확인 및 초기화
    const existingRoles = await db.select().from(roles);
    if (existingRoles.length === 0) {
      console.log("[init] 역할 초기 설정중...");
      await initializeRoles();
      console.log("[init] 역할 초기 설정 완료");
    }

    // 2. 시스템 관리자 계정 확인 및 생성
    const sysAdminExists = await systemAdminExists();
    if (!sysAdminExists) {
      console.log("[init] 시스템 관리자 계정 생성 중...");
      await createSystemAdmin();
      console.log("[init] 시스템 관리자 계정 생성 완료");
    }

    console.log("[init] 데이터베이스 초기화 완료");
  } catch (error) {
    console.error("[init] 데이터베이스 초기화 실패:", error);
    throw error;
  }
}

/**
 * 시스템 관리자 계정 생성
 */
async function createSystemAdmin() {
  const { email, name, password } = sysadmin;

  if (!email || !password) {
    console.warn("[init] SYSADMIN_EMAIL 또는 SYSADMIN_PASSWORD 환경변수가 설정되지 않았습니다");
    return;
  }

  // 이메일 중복 확인
  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser) {
    console.log(`[init] 이메일 ${email}로 등록된 사용자가 이미 존재합니다`);
    return;
  }

  // 시스템 관리자 역할 조회
  const systemAdminRole = await getRoleByName(ROLE_NAMES.SYSTEM_ADMIN);
  if (!systemAdminRole) {
    console.error("[init] 시스템 관리자 역할이 존재하지 않습니다");
    return;
  }

  // 비밀번호 해싱
  const hashedPassword = await hashPassword(password);

  // 시스템 관리자 계정 생성
  await writeDb.insert(users).values({
    email,
    name,
    password: hashedPassword,
    role_id: systemAdminRole.id,
    is_email_verified: true,
    emailVerified: new Date(),
  });

  console.log(`[init] 시스템 관리자 계정 생성됨: ${email}`);
}
