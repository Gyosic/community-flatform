"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isNil } from "es-toolkit";
import { Session, User } from "next-auth";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { TemplateFormItem } from "@/components/form/TemplateFormItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { fieldModelBuilder } from "@/lib/zod";
import { fileSchema } from "@/lib/zod/file";

const profileSchema = z.object({
  image: z
    .array(z.instanceof(File).or(fileSchema))
    .optional()
    .describe(
      JSON.stringify({
        name: "프로필 사진",
        type: "avatar",
        accept: ["image"],
        unoptimized: true,
      }),
    ),
  name: z
    .string()
    .max(20, "표시이름은 최대 20글자입니다")
    .describe(JSON.stringify({ name: "표시이름", placeholder: "최대 20글자" })),
});
type ProfileSchema = z.infer<typeof profileSchema>;
interface ProfileProps {
  // me: ProfileSchema & User;
  baseurl: string;
  session: Session;
}
const { fieldModel } = fieldModelBuilder({ schema: profileSchema });
export function Profile({ session, baseurl }: ProfileProps) {
  const form = useForm({ resolver: zodResolver(profileSchema), mode: "onBlur", defaultValues: {} });
  const { handleSubmit } = form;
  const onSubmit = handleSubmit(async (inputs) => {
    try {
      const formData = new FormData();

      Object.entries(inputs).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item instanceof File) formData.append(key, item);
          });
        } else if (!isNil(value)) {
          formData.append(key, value as string);
        }
      });

      if (session.user.id) formData.append("id", session.user.id);

      const res = await fetch(new URL("/api/users/profile", baseurl), {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: "Bearer " + session.access_token,
        },
      });
      if (!res.ok) return toast.error("오류", { description: await res.text() });
    } catch (err) {
      toast.error("오류", { description: JSON.stringify(err) });
    }
  });

  useEffect(() => {
    Object.keys(fieldModel).forEach((fieldKey) => {
      form.setValue(
        fieldKey as keyof ProfileSchema,
        session?.user?.[fieldKey as keyof ProfileSchema],
      );
    });
  }, [session]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {Object.entries(fieldModel).map(([fieldKey, fieldModel]) => {
              return (
                <FormField
                  key={fieldKey}
                  control={form.control}
                  name={fieldKey as keyof ProfileSchema}
                  render={({ field }) => {
                    return (
                      <TemplateFormItem field={field} fieldModel={fieldModel}></TemplateFormItem>
                    );
                  }}
                ></FormField>
              );
            })}
            <Button>저장</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
