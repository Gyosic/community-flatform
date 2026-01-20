import "next-auth";
import type { User as SchemaUser } from "@/lib/db/schema/users";

declare module "next-auth" {
  interface User extends SchemaUser {}

  interface Session {
    user: User;
  }
}
