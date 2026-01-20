import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력하세요" },
        { status: 400 },
      );
    }

    // 사용자 조회
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다" },
        { status: 401 },
      );
    }

    // 비밀번호 검증
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다" },
        { status: 401 },
      );
    }

    // 계정 상태 확인
    if (!user.is_active) {
      return NextResponse.json(
        { error: "비활성화된 계정입니다" },
        { status: 403 },
      );
    }

    if (user.is_banned) {
      return NextResponse.json({ error: "정지된 계정입니다" }, { status: 403 });
    }

    // 세션 생성
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "로그인 중 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
