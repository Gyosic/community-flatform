"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { TemplateFormItem } from "@/components/form/TemplateFormItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth/actions";
import { FieldModel } from "@/types";

const schema = z.object({
  email: z.string().describe(JSON.stringify({ name: "이메일", placeholder: "name@example.com" })),
  password: z
    .string()
    .describe(JSON.stringify({ name: "비밀번호", type: "password", placeholder: "********" })),
});
type Schema = z.infer<typeof schema>;
export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const fieldModel = useMemo<Record<string, FieldModel>>(() => {
    return Object.entries(schema.shape).reduce(
      (acc, [key, { type, description }]) => {
        acc[key] = { type, ...JSON.parse(description || "{}") };
        return acc;
      },
      {} as Record<string, FieldModel>,
    );
  }, []);

  const form = useForm<Schema>({ resolver: zodResolver(schema), mode: "onBlur" });

  const { handleSubmit } = form;
  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);

    try {
      await login(data.email, data.password);

      router.push("/");
    } catch {
      toast("로그인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="container max-w-md">
      <div className="flex flex-col gap-8">
        {/* 로고 */}
        <Link href="/" className="flex items-center justify-center gap-2">
          <span className="font-bold text-xl">Community</span>
        </Link>

        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-bold text-3xl tracking-tight">로그인</h1>
          <p className="text-muted-foreground text-sm">계정에 로그인하세요</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardDescription>이메일과 비밀번호를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                {Object.entries(fieldModel).map(([fieldKey, fieldModel]) => {
                  return (
                    <FormField
                      key={fieldKey}
                      control={form.control}
                      name={fieldKey as keyof Schema}
                      render={({ field }) => {
                        return (
                          <TemplateFormItem
                            field={field}
                            fieldModel={fieldModel}
                          ></TemplateFormItem>
                        );
                      }}
                    ></FormField>
                  );
                })}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "로그인 중..." : "로그인"}
                </Button>

                <div className="text-center text-muted-foreground text-sm">
                  계정이 없으신가요?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    회원가입
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
