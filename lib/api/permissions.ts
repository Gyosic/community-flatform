import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { permissions, roles, users } from "@/lib/db/schema";

export type PermissionType = "read" | "write" | "comment" | "delete" | "edit" | "pin" | "manage";

const ADMIN_ROLES = ["sysadmin", "admin"];

export async function checkBoardPermission(
  userId: string | null,
  boardId: string,
  permission: PermissionType,
): Promise<boolean> {
  if (!userId) {
    return permission === "read";
  }

  const user = await db
    .select({
      role_id: users.role_id,
      role_name: roles.name,
      role_priority: roles.priority,
    })
    .from(users)
    .innerJoin(roles, eq(users.role_id, roles.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!user[0]) return false;

  if (ADMIN_ROLES.includes(user[0].role_name)) {
    return true;
  }

  const permResult = await db
    .select()
    .from(permissions)
    .where(
      and(
        eq(permissions.role_id, user[0].role_id),
        or(eq(permissions.board_id, boardId), isNull(permissions.board_id)),
      ),
    )
    .limit(2);

  const boardPerm = permResult.find((p) => p.board_id === boardId);
  const globalPerm = permResult.find((p) => p.board_id === null);
  const perm = boardPerm || globalPerm;

  if (!perm) return permission === "read";

  const permMap: Record<PermissionType, keyof typeof perm> = {
    read: "can_read",
    write: "can_write",
    comment: "can_comment",
    delete: "can_delete",
    edit: "can_edit",
    pin: "can_pin",
    manage: "can_manage",
  };

  return (perm[permMap[permission]] as number) === 1;
}

export async function getUserRole(userId: string) {
  const result = await db
    .select({
      role_id: users.role_id,
      role_name: roles.name,
      role_priority: roles.priority,
      display_name: roles.display_name,
    })
    .from(users)
    .innerJoin(roles, eq(users.role_id, roles.id))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] || null;
}

export function isAdmin(roleName: string): boolean {
  return ADMIN_ROLES.includes(roleName);
}
