import { Profile } from "@/app/(default)/profile/Profile";
import { app } from "@/config";
import { auth } from "@/lib/auth";

export default async function VerifyEmailPage() {
  const session = await auth();

  if (!session) return <div>유효하지 않은 인증 링크입니다.</div>;

  // const res = await fetch(new URL(`/api/auth/me?id=${session.user.id}`, app.baseurl), {
  //   method: "GET",
  //   headers: {
  //     Authorization: "Bearer " + session.access_token,
  //   },
  // });

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Profile session={session} baseurl={app.baseurl} />
    </div>
  );
}
