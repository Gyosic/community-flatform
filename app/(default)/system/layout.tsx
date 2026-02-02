import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const ADMIN_ROLES = ["sysadmin", "admin"];

export default async function SystemLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const userRole = session.user.role;
  if (!userRole || !ADMIN_ROLES.includes(userRole)) redirect("/");

  return <>{children}</>;
}
