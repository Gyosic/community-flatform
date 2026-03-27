import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";
import { SignJWT } from "jose";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Naver from "next-auth/providers/naver";
import { authorize } from "@/lib/auth/authorization";
import { writeDb } from "@/lib/db";
import { accounts, users } from "@/lib/db/schema/users";
import { roles } from "@/lib/db/schema/roles";

export type NextAuthPageSearchParams = Promise<{ callbackUrl?: string }>;

export interface Credentials {
  email: string;
  password: string;
}

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

const authConfig = {
  session: { strategy: "jwt" },
  adapter: DrizzleAdapter(writeDb, {
    usersTable: users,
    accountsTable: accounts,
  }),
  providers: [
    CredentialsProvider({
      id: "credentials",
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, email, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {
          label: "Username",
          type: "text",
          placeholder: "ID를 입력해주세요.",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "비밀번호를 입력해주세요.",
        },
      },
      // Signin 할 때 사용 함: 사용자 정보 조회하고 객체 리턴하는 함수
      authorize,
    }),
    Google({ allowDangerousEmailAccountLinking: true }),
    Naver({ allowDangerousEmailAccountLinking: true }),
  ],
  pages: {
    signIn: "/",
    signOut: "/signout",
    error: "/error",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) {
        const result = await writeDb
          .select({ role: roles.name })
          .from(users)
          .innerJoin(roles, eq(users.role_id, roles.id))
          .where(eq(users.id, user.id))
          .then((rows) => rows[0]);

        return { ...token, ...user, role: result?.role };
      }
      return token;
    },
    session: async ({ session, token: { refresh_token, password, salt, ...user } }) => {
      if (!!user?.image && !(user.image as string).includes("http"))
        Object.assign(user, { image: `/api/files${user.image}` });

      session.access_token = await new SignJWT({
        sub: user.sub,
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(secret);

      return Object.assign(session, { user });
    },
    signIn: async ({ user }): Promise<boolean> => Boolean(user.id),
    authorized: async ({ auth }): Promise<boolean> => Boolean(auth),
  },
  events: {
    async createUser({ user }) {
      if (!user.email) return;

      if (user.is_email_verified) return;

      await writeDb
        .update(users)
        .set({ emailVerified: new Date(), is_email_verified: true })
        .where(eq(users.email, user.email));
    },
    async linkAccount({ user }) {
      if (!user.id) return;

      if (user.is_email_verified) return;

      await writeDb
        .update(users)
        .set({ emailVerified: new Date(), is_email_verified: true })
        .where(eq(users.id, user.id));
    },
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;

export default authConfig;
