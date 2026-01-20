"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }

    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "회원가입에 실패했습니다");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md">
      <div className="flex flex-col gap-8">
        {/* 로고 */}
        <Link href="/" className="flex items-center justify-center gap-2">
          <span className="text-xl font-bold">Community</span>
        </Link>

        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">회원가입</h1>
          <p className="text-sm text-muted-foreground">새 계정을 만드세요</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>회원가입</CardTitle>
            <CardDescription>계정 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="name">표시 이름*</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="아이디"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">비밀번호 *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="최소 8자 이상"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="passwordConfirm">비밀번호 확인 *</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "가입 중..." : "회원가입"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  로그인
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
