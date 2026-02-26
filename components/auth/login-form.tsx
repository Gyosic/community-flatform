"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { TemplateFormItem } from "@/components/form/TemplateFormItem";
import { GoogleButton } from "@/components/shared/GoogleButton";
import { NaverButton } from "@/components/shared/NaverButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldSeparator } from "@/components/ui/field";
import { Form, FormField } from "@/components/ui/form";
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
      const { error } = await login(data.email, data.password);

      if (error) toast.error(error.error, { description: error.message });
      else router.push("/");
    } catch {
      toast.error("로그인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  });

  const oauthSignin = async (provider: "google" | "naver") => {
    await signIn(provider);
  };

  return (
    <div className="container max-w-md">
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome!</CardTitle>
            <CardDescription>소셜 로그인으로 빠르게 시작하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <GoogleButton
                  type="button"
                  text="구글로 시작하기"
                  variant="outline"
                  onClick={() => oauthSignin("google")}
                />
                <NaverButton
                  type="button"
                  text="네이버로 시작하기"
                  onClick={() => oauthSignin("naver")}
                />
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>
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
                  <Link href="/signup" className="text-primary hover:underline">
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
