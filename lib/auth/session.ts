import type { Session } from "next-auth";
import type { SessionContextValue } from "next-auth/react";

export function getSession(context: SessionContextValue | Session | null): Session | null {
  if (!context) return context;

  if (Object.hasOwn(context, "data")) return (<SessionContextValue>context).data;

  return context as Session;
}

export function isSys(context: SessionContextValue | Session | null) {
  return getSession(context)?.user?.role === "sysadmin";
}

export function isAdmin(context: SessionContextValue | Session | null) {
  const role = getSession(context)?.user?.role;
  return role === "admin" || role === "sysadmin";
}

export function get(context: SessionContextValue | Session | null, key: keyof Session["user"]) {
  return getSession(context)?.user[key];
}

export function id(context: SessionContextValue | Session | null) {
  return getSession(context)?.user.id;
}

export function token(_context: SessionContextValue | Session | null) {
  return "";
}

export function isAuthenticated(context: SessionContextValue | null) {
  return context?.status === "authenticated";
}
