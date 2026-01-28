"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isNil } from "es-toolkit/compat";
import { createElement, useMemo } from "react";
import { useForm } from "react-hook-form";
import z, { ZodObject } from "zod";
import { TemplateFormItem } from "@/components/form/TemplateFormItem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { useDynamicIcon } from "@/hooks/use-lucide-icon";
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
  icon?: string;
}
function CardSection({ schema, title, description, icon }: CardSectionProps) {
  const { fieldModel, defaultValues } = useMemo(() => {
    const defaultValues: Record<string, unknown> = {};
    const fieldModel = Object.entries(schema.shape).reduce(
      (acc, [fieldKey, { type, description = "{}" }]) => {
        const model = JSON.parse(description);
        acc[fieldKey] = { type, ...model };
        if (!isNil(model?.default)) defaultValues[fieldKey] = model.default;
        return acc;
      },
      {} as Record<string, FieldModel>,
    );

    return { fieldModel, defaultValues };
  }, [schema]);
  type Schema = z.infer<typeof schema>;
  const form = useForm({ resolver: zodResolver(schema), mode: "onBlur", defaultValues });
  const { handleSubmit } = form;
  const onSubmit = handleSubmit(async (inputs) => {});
  const iconComponent = useDynamicIcon(icon);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {iconComponent && createElement(iconComponent, { className: "size-4" })}
          {title}
        </CardTitle>
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
      icon: "BadgeInfo",
    },
    {
      schema: themeSchema,
      title: "테마 설정",
      description: "사이트 색상과 다크모드를 설정합니다.",
      icon: "Palette",
    },
    {
      schema: permissionSchema,
      title: "권한 설정",
      description: "회원의 권한 등을 설정합니다.",
      icon: "PersonStanding",
    },
    {
      schema: featureSchema,
      title: "기능 설정",
      description: "각종 기능을 설정합니다.",
      icon: "SquareFunction",
    },
    {
      schema: seoSchema,
      title: "검색엔진 설정",
      description: "구글, 네이버 등 검색 사이트에 노출하는 정보를 설정합니다.",
      icon: "Bot",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {configures.map((configure, i) => (
        <CardSection {...configure} key={i} />
      ))}
    </div>
  );
}
