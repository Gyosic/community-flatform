import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  // 이미 로그인되어 있으면 홈으로 리다이렉트
  const session = await auth();

  if (session) redirect("/");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30">
      <LoginForm />
    </div>
  );
}
