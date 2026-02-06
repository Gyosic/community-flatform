"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { kMaxLength } from "buffer";
import { get, isNil, set, unset } from "es-toolkit/compat";
import { createElement, useEffect, useMemo } from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import z, { ZodObject } from "zod";
import { TemplateFormItem } from "@/components/form/TemplateFormItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { useDynamicIcon } from "@/hooks/use-lucide-icon";
import { loading } from "@/lib/store/loading";
import { fieldModelBuilder } from "@/lib/zod";
import {
  configures,
  featureSchema,
  permissionSchema,
  SiteSettingType,
  seoSchema,
  siteInfoSchema,
  siteSettingSchema,
  themeSchema,
} from "@/lib/zod/site-settings";
import { FieldModel } from "@/types";

interface CardSectionProps {
  schema: ZodObject;
  title: string;
  description?: string;
  icon?: string;
  baseKey?: string;
  form: UseFormReturn<SiteSettingType>;
}
function CardSection({ schema, title, description, icon, baseKey, form }: CardSectionProps) {
  const { fieldModel, defaultValues } = fieldModelBuilder({ schema });

  const iconComponent = useDynamicIcon(icon);

  useEffect(() => {
    if (Object.keys(defaultValues).length) {
      Object.entries(defaultValues).forEach(([fieldKey, value]) => {
        const key = baseKey ? `${baseKey}.${fieldKey}` : fieldKey;
        // biome-ignore lint/suspicious/noExplicitAny: defaultValue
        form.setValue(key as keyof SiteSettingType, value as any);
      });
    }
  }, [defaultValues]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {iconComponent && createElement(iconComponent, { className: "size-4" })}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {Object.entries(fieldModel).map(([fieldKey, fieldModel]) => {
          const key = baseKey ? `${baseKey}.${fieldKey}` : fieldKey;
          return (
            <FormField
              key={fieldKey}
              control={form.control}
              name={key as keyof SiteSettingType}
              render={({ field }) => {
                return <TemplateFormItem field={field} fieldModel={fieldModel}></TemplateFormItem>;
              }}
            ></FormField>
          );
        })}
      </CardContent>
    </Card>
  );
}

interface SiteConfigureProps {
  config: SiteSettingType & { id?: string };
}
export function SiteConfigure({ config }: SiteConfigureProps) {
  const fileTypes = configures.reduce((acc, { schema, baseKey }) => {
    Object.entries(schema.shape).forEach(([fieldKey, { type, description = "{}" }]) => {
      const key = baseKey ? `${baseKey}.${fieldKey}` : fieldKey;
      const model = JSON.parse(description);
      const fieldType = model?.type ?? type;
      if (fieldType === "file") acc.push(key);
    });
    return acc;
  }, [] as string[]);

  const form = useForm({
    resolver: zodResolver(siteSettingSchema),
    mode: "onBlur",
    defaultValues: config,
  });
  const { handleSubmit } = form;
  const onSubmit = handleSubmit(
    async (inputs) => {
      try {
        loading.show("환경설정 하는중...");

        const nonFileData = JSON.parse(JSON.stringify(inputs));
        const formdata = new FormData();

        for (const path of fileTypes) {
          // 파일 데이터는 따로 append
          unset(nonFileData, path);
          const fileData = get(inputs, path);
          for (const file of fileData) {
            if (file instanceof File) formdata.append(path, file);
            else formdata.append(path, JSON.stringify(file));
          }
        }

        Object.entries(nonFileData).forEach(([key, value]) => {
          if (typeof value === "object") formdata.append(key, JSON.stringify(value));
          else formdata.append(key, value as string);
        });

        if (config.id) {
          formdata.append("id", config.id);
          const res = await fetch("/api/system/config", { method: "PUT", body: formdata });

          if (!res.ok) return toast.error(await res.text());
        } else {
          const res = await fetch("/api/system/config", { method: "POST", body: formdata });

          if (!res.ok) return toast.error(await res.text());
        }

        toast.success("환경설정 완료");
      } catch {
        toast.error("환경설정 실패");
      } finally {
        loading.hide();
      }
    },
    (invalid) => {
      console.info(invalid);
    },
  );

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {configures.map((configure, i) => (
          <CardSection {...configure} key={i} form={form} />
        ))}
        <Button>저장</Button>
      </form>
    </Form>
  );
}
