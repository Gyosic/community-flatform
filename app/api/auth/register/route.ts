import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { db, writeDb } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // 유효성 검사
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력하세요" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 최소 8자 이상이어야 합니다" },
        { status: 400 },
      );
    }

    // 이메일 중복 확인
    const [existingEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다" },
        { status: 409 },
      );
    }

    // 아이디 중복 확인
    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.name, name))
      .limit(1);

    if (existingUsername) {
      return NextResponse.json(
        { error: "이미 사용 중인 아이디입니다" },
        { status: 409 },
      );
    }

    // 신규회원 역할 찾기
    const [newbieRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "newbie"))
      .limit(1);

    if (!newbieRole) {
      return NextResponse.json({ error: "역할 설정 오류" }, { status: 500 });
    }

    // 비밀번호 해싱
    const passwordHash = await hashPassword(password);

    // 사용자 생성
    const [newUser] = await writeDb
      .insert(users)
      .values({
        email,
        name,
        password: passwordHash,
        role_id: newbieRole.id,
        level: 1,
        experience: 0,
        is_active: true,
        is_email_verified: false,
        is_banned: false,
      })
      .returning();

    // 세션 생성 (자동 로그인)
    await createSession(newUser.id);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
