import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { app } from "@/config";
import { auth } from "@/lib/auth";

export default async function SignupPage() {
  // 이미 로그인되어 있으면 홈으로 리다이렉트
  const session = await auth();

  if (session) redirect("/");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignupForm baseurl={app.baseurl} />
      </div>
    </div>
  );
}
