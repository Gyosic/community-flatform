import { redirect } from "next/navigation";
import { isInstalled } from "@/lib/data/site-settings";
import { SetupWizard } from "@/components/setup/setup-wizard";

export default async function SetupPage() {
  // 이미 설치되었으면 홈으로 리다이렉트
  const installed = await isInstalled();
  if (installed) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30">
      <SetupWizard />
    </div>
  );
}
