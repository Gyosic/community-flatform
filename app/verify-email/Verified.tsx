"use client";

import { ArrowRight, CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function Verified() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-col items-center justify-center gap-8">
        <CircleCheck size={48} />
        <h1 className="font-bold text-2xl">이메일 인증완료!</h1>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-8">
          <p className="text-muted-foreground">
            이메일 주소 인증이 완료되었습니다. 로그인하여 서비스를 이용해주세요.
          </p>
          <Button className="w-full" onClick={() => router.push("/signin")}>
            로그인하기 <ArrowRight />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
