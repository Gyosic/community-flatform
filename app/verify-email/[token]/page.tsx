import { UnVerified } from "@/app/verify-email/UnVerified";
import { Verified } from "@/app/verify-email/Verified";
import { app } from "@/config";

type Params = { token: string };

const verifyEmail = async (token: string) => {
  try {
    const res = await fetch(new URL(`/api/auth/verify-email?token=${token}`, app.baseurl), {
      method: "GET",
    });

    if (!res.ok) return false;

    return true;
  } catch {
    return false;
  }
};

export default async function VerifyEmailPage({ params }: { params: Promise<Params> }) {
  const { token } = await params;

  if (!token) return <div>유효하지 않은 인증 링크입니다.</div>;

  const isVerified = await verifyEmail(token);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      {isVerified ? <Verified /> : <UnVerified token={token} baseurl={app.baseurl} />}
    </div>
  );
}
