import { and, eq } from "drizzle-orm";
import { db, writeDb } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";

/**
 * 역할 이름 상수
 */
export const ROLE_NAMES = {
  SYSTEM_ADMIN: "sysadmin",
  ADMIN: "admin",
  MODERATOR: "moderator",
  MEMBER: "member",
  NEW_MEMBER: "newbie",
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

/**
 * 역할 우선순위 (숫자가 높을수록 높은 권한)
 */
export const ROLE_PRIORITY = {
  [ROLE_NAMES.SYSTEM_ADMIN]: 100,
  [ROLE_NAMES.ADMIN]: 90,
  [ROLE_NAMES.MODERATOR]: 50,
  [ROLE_NAMES.MEMBER]: 10,
  [ROLE_NAMES.NEW_MEMBER]: 1,
} as const;

/**
 * 역할 ID를 이름으로 조회
 */
export async function getRoleByName(name: RoleName) {
  const [role] = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
  return role ?? null;
}

/**
 * 역할 ID로 역할 정보 조회
 */
export async function getRoleById(roleId: string) {
  const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
  return role ?? null;
}

/**
 * 사용자가 특정 역할인지 확인
 */
export async function hasRole(userId: string, roleName: RoleName): Promise<boolean> {
  const role = await getRoleByName(roleName);
  if (!role) return false;

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), eq(users.role_id, role.id)))
    .limit(1);

  return !!user;
}

/**
 * 사용자가 시스템 관리자인지 확인
 */
export async function isSystemAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, ROLE_NAMES.SYSTEM_ADMIN);
}

/**
 * 사용자가 관리자인지 확인
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, ROLE_NAMES.ADMIN);
}

/**
 * 관리자 계정이 존재하는지 확인
 */
export async function adminExists(): Promise<boolean> {
  const adminRole = await getRoleByName(ROLE_NAMES.ADMIN);
  if (!adminRole) return false;

  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role_id, adminRole.id))
    .limit(1);

  return !!admin;
}

/**
 * 시스템 관리자 계정이 존재하는지 확인
 */
export async function systemAdminExists(): Promise<boolean> {
  const systemAdminRole = await getRoleByName(ROLE_NAMES.SYSTEM_ADMIN);
  if (!systemAdminRole) return false;

  const [systemAdmin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role_id, systemAdminRole.id))
    .limit(1);

  return !!systemAdmin;
}

/**
 * 기본 역할 초기화 (역할이 없을 때만 생성)
 */
export async function initializeRoles() {
  const existingRoles = await db.select().from(roles);
  if (existingRoles.length > 0) return;

  const defaultRoles = [
    {
      name: ROLE_NAMES.SYSTEM_ADMIN,
      display_name: "시스템 관리자",
      description: "시스템 전체를 관리하는 최고 권한자",
      priority: ROLE_PRIORITY[ROLE_NAMES.SYSTEM_ADMIN],
      min_level: 1,
    },
    {
      name: ROLE_NAMES.ADMIN,
      display_name: "관리자",
      description: "커뮤니티를 운영하는 관리자",
      priority: ROLE_PRIORITY[ROLE_NAMES.ADMIN],
      min_level: 1,
    },
    {
      name: ROLE_NAMES.MODERATOR,
      display_name: "운영진",
      description: "게시판을 관리하는 운영진",
      priority: ROLE_PRIORITY[ROLE_NAMES.MODERATOR],
      min_level: 5,
    },
    {
      name: ROLE_NAMES.MEMBER,
      display_name: "일반회원",
      description: "일반 회원",
      priority: ROLE_PRIORITY[ROLE_NAMES.MEMBER],
      min_level: 2,
    },
    {
      name: ROLE_NAMES.NEW_MEMBER,
      display_name: "신규회원",
      description: "가입 후 인증 전 회원",
      priority: ROLE_PRIORITY[ROLE_NAMES.NEW_MEMBER],
      min_level: 1,
    },
  ];

  await writeDb.insert(roles).values(defaultRoles);
}
