import "next-auth";
import type { User as SchemaUser } from "@/lib/db/schema/users";

declare module "next-auth" {
  interface User extends SchemaUser {
    role?: string;
    is_email_verified?: boolean;
    access_token?: string;
    image?: FileType;
  }

  interface Session {
    user: User;
    access_token: string;
  }
}
