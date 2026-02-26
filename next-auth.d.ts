import "next-auth";
import type { User as SchemaUser } from "@/lib/db/schema/users";

declare module "next-auth" {
  interface User extends SchemaUser {
    role?: string;
    is_email_verified?: boolean;
  }

  interface Session {
    user: User;
  }
}
