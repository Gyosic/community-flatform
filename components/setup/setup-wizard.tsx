"use client";

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
import { Textarea } from "@/components/ui/textarea";

type Step = "site" | "admin" | "complete";

export function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("site");
  const [loading, setLoading] = useState(false);

  // 사이트 정보
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");

  // 관리자 정보
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState("");

  const handleSiteInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) return;
    setStep("admin");
  };

  const handleAdminInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (adminPassword !== adminPasswordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (adminPassword.length < 8) {
      alert("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: siteName,
          site_description: siteDescription,
          admin: {
            email: adminEmail,
            name: adminName,
            password: adminPassword,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("설치에 실패했습니다.");
      }

      setStep("complete");
    } catch (error) {
      console.error("Setup failed:", error);
      alert("설치 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    router.push("/");
    router.refresh();
  };

  return (
    <div className="container max-w-md">
      <div className="flex flex-col gap-8">
        {/* 로고 */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl font-bold">Community</span>
        </div>

        {/* 헤더 */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">커뮤니티 설치</h1>
          <p className="text-sm text-muted-foreground">
            {step === "site" && "사이트 기본 정보를 입력하세요"}
            {step === "admin" && "관리자 계정을 생성하세요"}
            {step === "complete" && "설치가 완료되었습니다"}
          </p>
        </div>

        {/* 진행 상태 */}
        <div className="flex items-center justify-center gap-2">
          <div
            className={`h-2 w-16 rounded-full ${step === "site" ? "bg-primary" : "bg-primary/30"}`}
          />
          <div
            className={`h-2 w-16 rounded-full ${step === "admin" ? "bg-primary" : "bg-primary/30"}`}
          />
          <div
            className={`h-2 w-16 rounded-full ${step === "complete" ? "bg-primary" : "bg-primary/30"}`}
          />
        </div>

        {/* 사이트 정보 */}
        {step === "site" && (
          <Card>
            <CardHeader>
              <CardTitle>사이트 정보</CardTitle>
              <CardDescription>
                커뮤니티의 기본 정보를 설정합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSiteInfoSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="siteName">사이트 이름 *</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="예: 내 커뮤니티"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="siteDescription">사이트 설명</Label>
                  <Textarea
                    id="siteDescription"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    placeholder="커뮤니티에 대한 간단한 설명을 입력하세요"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  다음
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 관리자 정보 */}
        {step === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle>관리자 계정</CardTitle>
              <CardDescription>
                사이트를 관리할 관리자 계정을 생성합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleAdminInfoSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="adminEmail">이메일 *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="adminName">표시 이름 *</Label>
                  <Input
                    id="adminName"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="관리자"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="adminPassword">비밀번호 *</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="최소 8자 이상"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="adminPasswordConfirm">비밀번호 확인 *</Label>
                  <Input
                    id="adminPasswordConfirm"
                    type="password"
                    value={adminPasswordConfirm}
                    onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("site")}
                    disabled={loading}
                  >
                    이전
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "설치 중..." : "설치"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 완료 */}
        {step === "complete" && (
          <Card>
            <CardHeader>
              <CardTitle>설치 완료</CardTitle>
              <CardDescription>
                커뮤니티가 성공적으로 설치되었습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  이제 관리자 계정으로 로그인하여 커뮤니티를 관리할 수 있습니다.
                </p>
              </div>

              <Button onClick={handleComplete} className="w-full">
                시작하기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
