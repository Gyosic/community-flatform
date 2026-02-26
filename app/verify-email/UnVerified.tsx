"use client";

import { ArrowRight, CircleCheck, CircleX } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface UnVerifiedProps {
  token: string;
  baseurl: string;
}
export function UnVerified({ token, baseurl }: UnVerifiedProps) {
  const router = useRouter();

  const verifyEmail = async () => {
    await fetch(new URL(`/api/auth/verify-email?token=${token}`, baseurl), {
      method: "GET",
    });

    router.push("/signin");
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-center justify-center gap-8">
        <CircleX size={48} />
        <h1 className="font-bold text-2xl">이메일 인증실패!</h1>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-8">
          <p className="text-muted-foreground">
            이메일 주소 인증이 실패했습니다. 다시 시도해주세요.
          </p>
          <Button className="w-full" onClick={() => verifyEmail()}>
            다시 인증하기
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.back()}>
            돌아가기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
