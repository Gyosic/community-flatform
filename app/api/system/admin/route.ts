import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { hashPassword } from "@/lib/auth/password";
import { adminExists, getRoleByName, isSystemAdmin, ROLE_NAMES } from "@/lib/auth/roles";
import {
  conflictResponse,
  forbiddenResponse,
  internalServerErrorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api/api-response";
import { db, writeDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

interface CreateAdminRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * GET /api/system/admin
 * 관리자 계정 존재 여부 확인
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse("로그인이 필요합니다");
  }

  // 시스템 관리자만 접근 가능
  const isSysAdmin = await isSystemAdmin(session.user.id);
  if (!isSysAdmin) {
    return forbiddenResponse("시스템 관리자만 접근할 수 있습니다");
  }

  const exists = await adminExists();
  const adminRole = await getRoleByName(ROLE_NAMES.ADMIN);

  if (exists && adminRole) {
    // 관리자 정보 조회
    const [admin] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        created_at: users.created_at,
      })
      .from(users)
      .where(eq(users.role_id, adminRole.id))
      .limit(1);

    return successResponse({ exists: true, admin });
  }

  return successResponse({ exists: false, admin: null });
}

/**
 * POST /api/system/admin
 * 관리자 계정 생성 (시스템 관리자만 가능, 1개 제한)
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse("로그인이 필요합니다");
  }

  // 시스템 관리자만 접근 가능
  const isSysAdmin = await isSystemAdmin(session.user.id);
  if (!isSysAdmin) {
    return forbiddenResponse("시스템 관리자만 관리자 계정을 생성할 수 있습니다");
  }

  // 이미 관리자가 존재하는지 확인
  const exists = await adminExists();
  if (exists) {
    return conflictResponse("관리자 계정은 1개만 생성할 수 있습니다");
  }

  // 요청 데이터 파싱
  let body: CreateAdminRequest;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse("잘못된 요청 형식입니다");
  }

  const { email, password, name } = body;

  // 유효성 검사
  if (!email || !password || !name) {
    return validationErrorResponse("이메일, 비밀번호, 이름은 필수입니다");
  }

  if (password.length < 8) {
    return validationErrorResponse("비밀번호는 8자 이상이어야 합니다");
  }

  // 이메일 중복 확인
  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser) {
    return conflictResponse("이미 사용 중인 이메일입니다");
  }

  // 관리자 역할 조회
  const adminRole = await getRoleByName(ROLE_NAMES.ADMIN);
  if (!adminRole) {
    return internalServerErrorResponse("관리자 역할이 존재하지 않습니다. 역할을 먼저 초기화해주세요.");
  }

  // 비밀번호 해싱
  const hashedPassword = await hashPassword(password);

  // 관리자 계정 생성
  const [newAdmin] = await writeDb
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      name,
      role_id: adminRole.id,
      is_email_verified: true,
      emailVerified: new Date(),
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      created_at: users.created_at,
    });

  return successResponse(
    {
      message: "관리자 계정이 생성되었습니다",
      admin: newAdmin,
    },
    201,
  );
}

/**
 * DELETE /api/system/admin
 * 관리자 계정 삭제 (시스템 관리자만 가능)
 */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse("로그인이 필요합니다");
  }

  // 시스템 관리자만 접근 가능
  const isSysAdmin = await isSystemAdmin(session.user.id);
  if (!isSysAdmin) {
    return forbiddenResponse("시스템 관리자만 관리자 계정을 삭제할 수 있습니다");
  }

  const adminRole = await getRoleByName(ROLE_NAMES.ADMIN);
  if (!adminRole) {
    return internalServerErrorResponse("관리자 역할이 존재하지 않습니다");
  }

  // 관리자 계정 삭제
  const deleted = await writeDb.delete(users).where(eq(users.role_id, adminRole.id)).returning({
    id: users.id,
  });

  if (deleted.length === 0) {
    return conflictResponse("삭제할 관리자 계정이 없습니다");
  }

  return successResponse({ message: "관리자 계정이 삭제되었습니다" });
}
