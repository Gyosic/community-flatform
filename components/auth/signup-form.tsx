"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { TemplateFormItem } from "@/components/form/TemplateFormItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { fieldModelBuilder } from "@/lib/zod";

export const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[#?!@$%^&*-])[^\s]{9,}$/;
const signupSchema = z
  .object({
    email: z.string().describe(JSON.stringify({ name: "이메일", placeholder: "name@example.com" })),
    name: z
      .string()
      .max(20, "표시이름은 최대 20글자입니다")
      .describe(JSON.stringify({ name: "표시이름", placeholder: "최대 20글자" })),
    password: z
      .string()
      .min(9, "비밀번호는 최소 9자 이상이어야 합니다.")
      .regex(passwordRegex, "영문자, 숫자, 특수문자(#?!@$%^&*-) 조합인 비밀번호만 생성 가능합니다.")
      .describe(
        JSON.stringify({
          name: "비밀번호",
          type: "password",
          desc: "영문자, 숫자, 특수문자(#?!@$%^&*-) 조합, 최소 9자 이상",
          placeholder: "********",
        }),
      ),
    passwordConfirm: z
      .string()
      .describe(
        JSON.stringify({ name: "비밀번호 확인", type: "password", placeholder: "********" }),
      ),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });
type SignupSchema = z.infer<typeof signupSchema>;
const { fieldModel } = fieldModelBuilder({ schema: signupSchema });

interface SignupFormProps {
  baseurl: string;
}
export function SignupForm({ baseurl }: SignupFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignupSchema>({ resolver: zodResolver(signupSchema), mode: "onBlur" });
  const { handleSubmit } = form;
  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);

    try {
      const res = await fetch(new URL("/api/auth/signup", baseurl), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        setLoading(false);

        return toast.error("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.", {
          description: await res.text(),
        });
      }

      toast.success("회원가입이 완료", {
        description:
          "가입하신 메일로 인증메일이 발송되었습니다. 메일함의 인증링크를 클릭하여 계정을 활성화해주세요.",
      });
      router.push("/signin");
    } catch (err) {
      toast.error("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.", {
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="container max-w-md">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-bold text-3xl tracking-tight">회원가입</h1>
          <p className="text-muted-foreground text-sm">새 계정을 만드세요</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>회원가입</CardTitle>
            <CardDescription>계정 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                {Object.entries(fieldModel).map(([fieldKey, fieldModel]) => {
                  return (
                    <FormField
                      key={fieldKey}
                      control={form.control}
                      name={fieldKey as keyof SignupSchema}
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
                  {loading ? "가입 중..." : "회원가입"}
                </Button>

                <div className="text-center text-muted-foreground text-sm">
                  이미 계정이 있으신가요?{" "}
                  <Link href="/signin" className="text-primary hover:underline">
                    로그인
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
