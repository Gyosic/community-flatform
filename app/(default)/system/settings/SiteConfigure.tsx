"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import z, { ZodObject } from "zod";
import { TemplateFormItem } from "@/components/form/TemplateFormItem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import {
  featureSchema,
  permissionSchema,
  seoSchema,
  siteInfoSchema,
  themeSchema,
} from "@/lib/zod/site-settings";
import { FieldModel } from "@/types";

interface CardSectionProps {
  schema: ZodObject;
  title: string;
  description?: string;
}
function CardSection({ schema, title, description }: CardSectionProps) {
  const fieldModel = useMemo(() => {
    return Object.entries(schema.shape).reduce(
      (acc, [fieldKey, { type, description = "{}" }]) => {
        acc[fieldKey] = { type, ...JSON.parse(description) };
        return acc;
      },
      {} as Record<string, FieldModel>,
    );
  }, [schema]);
  type Schema = z.infer<typeof schema>;
  const form = useForm({ resolver: zodResolver(schema), mode: "onBlur" });
  const { handleSubmit } = form;
  const onSubmit = handleSubmit(async (inputs) => {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-2">
            {Object.entries(fieldModel).map(([fieldKey, fieldModel]) => {
              return (
                <FormField
                  key={fieldKey}
                  control={form.control}
                  name={fieldKey as keyof Schema}
                  render={({ field }) => {
                    return (
                      <TemplateFormItem field={field} fieldModel={fieldModel}></TemplateFormItem>
                    );
                  }}
                ></FormField>
              );
            })}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// seoSchema
export function SiteConfigure() {
  const configures = [
    {
      schema: siteInfoSchema,
      title: "기본 정보",
      description: "사이트 이름, 설명, 로고를 설정합니다.",
    },
    {
      schema: themeSchema,
      title: "테마 설정",
      description: "사이트 색상과 다크모드를 설정합니다.",
    },
    {
      schema: permissionSchema,
      title: "권한 설정",
      description: "회원의 권한 등을 설정합니다.",
    },
    {
      schema: featureSchema,
      title: "기능 설정",
      description: "각종 기능을 설정합니다.",
    },
    {
      schema: seoSchema,
      title: "검색엔진 설정",
      description: "구글, 네이버 등 검색 사이트에 노출하는 정보를 설정합니다.",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {configures.map((configure) => (
        <CardSection {...configure} />
      ))}
    </div>
  );
}
