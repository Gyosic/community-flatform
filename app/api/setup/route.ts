import { type NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { createInitialSettings, isInstalled } from "@/lib/data/site-settings";
import { writeDb } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    // 이미 설치되었는지 확인
    const installed = await isInstalled();
    if (installed) {
      return NextResponse.json({ error: "Already installed" }, { status: 400 });
    }

    const body = await request.json();
    const { site_name, site_description, admin } = body;

    // 유효성 검사
    if (!site_name || !admin?.email || !admin?.username || !admin?.password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 트랜잭션으로 처리 (간단하게 순차 실행)
    // 1. 사이트 설정 생성
    await createInitialSettings({
      site_name,
      site_description,
    });

    // 2. sysadmin 역할 생성
    const [sysadminRole] = await writeDb
      .insert(roles)
      .values({
        name: "sysadmin",
        display_name: "시스템관리자",
        description: "시스템 전체를 관리하는 최고 권한자",
        min_level: 1,
        max_level: null,
        priority: 200,
        color: "#dc2626",
        badge_config: {
          icon: "shield-check",
          background_color: "#fee2e2",
          text_color: "#991b1b",
        },
      })
      .returning();

    // 3. 시스템관리자 계정 생성
    const passwordHash = await hashPassword(admin.password);
    await writeDb.insert(users).values({
      email: admin.email,
      name: admin.name,
      password: passwordHash,
      role_id: sysadminRole.id,
      level: 99,
      experience: 9999,
      is_active: true,
      is_email_verified: true,
      is_banned: false,
    });

    return NextResponse.json({
      success: true,
      message: "Installation completed successfully",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Installation failed" }, { status: 500 });
  }
}
