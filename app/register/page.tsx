import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  // 이미 로그인되어 있으면 홈으로 리다이렉트
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30">
      <RegisterForm />
    </div>
  );
}
