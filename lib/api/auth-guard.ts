import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ADMIN_ROLES = ["sysadmin", "admin"];

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 }),
    };
  }

  const userRole = session.user.role;
  if (!userRole || !ADMIN_ROLES.includes(userRole)) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "권한이 없습니다" }, { status: 403 }),
    };
  }

  return { authorized: true, session };
}

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 }),
    };
  }

  return { authorized: true, session };
}
