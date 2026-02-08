"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { GridLayout, LayoutWidget } from "@/app/(default)/system/pages/setting/GridLayout";
import { TemplateFormItem } from "@/components/form/TemplateFormItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { loading } from "@/lib/store/loading";
import { fieldModelBuilder } from "@/lib/zod";
import {
  type PageSchema,
  pageConfigSchema,
  pageDisplayConfigSchema,
  pageSchema,
} from "@/lib/zod/pages";

export function Setting() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageId = searchParams.get("id");
  const isEditMode = !!pageId;
  const [isPreview, setIsPreview] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [layout, setLayout] = useState<LayoutWidget[]>([]);

  const { fieldModel: pageInfoFieldModel, defaultValues: pageInfoDefaultValues } =
    fieldModelBuilder({
      schema: pageSchema.pick({ name: true, type: true, description: true }),
    });

  const { fieldModel: pageConfigFieldModel, defaultValues: pageConfigDefaultValues } =
    fieldModelBuilder({ schema: pageConfigSchema });

  const { fieldModel: pageDisplayConfigFieldModel, defaultValues: pageDisplayConfigDefaultValues } =
    fieldModelBuilder({ schema: pageDisplayConfigSchema });

  const form = useForm<PageSchema>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      ...pageInfoDefaultValues,
      config: pageConfigDefaultValues,
      display_config: pageDisplayConfigDefaultValues,
    },
  });

  useEffect(() => {
    if (isEditMode && pageId) {
      fetchPage(pageId);
    }
  }, [pageId, isEditMode]);

  const fetchPage = async (id: string) => {
    try {
      const res = await fetch(`/api/pages/${id}`);
      if (!res.ok) {
        toast.error("페이지 정보를 불러오는데 실패했습니다.");
        router.push("/system/pages");
        return;
      }
      const page = await res.json();
      form.reset({
        name: page.name,
        type: page.type,
        description: page.description || "",
        config: page.page_config || pageConfigDefaultValues,
        display_config: page.display_config || pageDisplayConfigDefaultValues,
        layout: page.layout || [],
      });
    } catch {
      toast.error("페이지 정보를 불러오는데 실패했습니다.");
      router.push("/system/pages");
    } finally {
      setInitialLoading(false);
    }
  };

  const { handleSubmit } = form;

  const onSubmit = handleSubmit(
    async (inputs) => {
      try {
        loading.show(isEditMode ? "페이지 수정 중..." : "페이지 생성 중...");

        const url = isEditMode ? `/api/pages/${pageId}` : "/api/pages";
        const method = isEditMode ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: inputs.name,
            description: inputs.description,
            type: inputs.type,
            config: inputs.config,
            display_config: inputs.display_config,
            layout: inputs.layout,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "작업에 실패했습니다.");
          return;
        }

        toast.success(isEditMode ? "페이지가 수정되었습니다." : "페이지가 생성되었습니다.");
        router.push("/system/pages");
      } catch (err) {
        const { message = "" } = err as { message?: string };
        toast.error("서버 오류가 발생했습니다.", { description: message });
      } finally {
        loading.hide();
      }
    },
    (invalid) => {
      console.info(invalid);
    },
  );

  useEffect(() => {
    if (layout) {
      form.setValue("layout", layout);
    }
  }, [layout]);

  if (initialLoading) {
    return (
      <div className="flex h-full gap-4">
        <Card className="w-80 shrink-0">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-0">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 pb-2">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">페이지 레이아웃 디자인</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isPreview ? "default" : "outline"}
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {isPreview ? "편집 모드" : "미리보기"}
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              저장
            </Button>
          </div>
        </div>
        <div className="flex h-full gap-4">
          <Card className={isPreview ? "hidden" : "h-full w-80 shrink-0"}>
            <CardContent className="flex h-full flex-1 flex-col gap-4">
              <div className="space-y-2">
                <h4 className="font-bold text-md">기본 정보</h4>
                <div className="flex flex-col gap-2">
                  {Object.entries(pageInfoFieldModel).map(([fieldKey, fieldModel]) => (
                    <FormField
                      key={fieldKey}
                      control={form.control}
                      name={fieldKey as keyof PageSchema}
                      render={({ field }) => (
                        <TemplateFormItem field={field} fieldModel={fieldModel} />
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-md">페이지 설정</h4>
                <div className="flex flex-col gap-2">
                  {Object.entries(pageConfigFieldModel).map(([fieldKey, fieldModel]) => {
                    const key = `config.${fieldKey}` as keyof PageSchema;
                    return (
                      <FormField
                        key={key}
                        control={form.control}
                        name={key}
                        render={({ field }) => (
                          <TemplateFormItem field={field} fieldModel={fieldModel} />
                        )}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-md">표시 설정</h4>
                <div className="flex flex-col gap-2">
                  {Object.entries(pageDisplayConfigFieldModel).map(([fieldKey, fieldModel]) => {
                    const key = `display_config.${fieldKey}` as keyof PageSchema;
                    return (
                      <FormField
                        key={key}
                        control={form.control}
                        name={key}
                        render={({ field }) => (
                          <TemplateFormItem field={field} fieldModel={fieldModel} />
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card className={isPreview ? "hidden" : "w-80 shrink-0"}>
          <CardHeader>
            <CardTitle>위젯 팔레트</CardTitle>
            <CardDescription>위젯을 선택하여 추가하세요</CardDescription>
          </CardHeader>
          <CardContent className="">
            <div className="flex flex-col gap-2">
              {widgets.map((widget) => {
                return (
                  <div
                    className="cursor-pointer rounded-lg border p-3 transition-all hover:border-primary hover:bg-accent"
                    key={widget.id}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                        {widget.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 font-medium text-sm">{widget.name}</p>
                        <p className="line-clamp-2 text-muted-foreground text-xs">
                          {widget.description}
                        </p>
                        <div className="mt-2 flex gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {widget.defaultSize.w}x{widget.defaultSize.h}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card> */}

          <GridLayout layout={layout} setLayout={setLayout} />
        </div>
      </form>
    </Form>
  );
}
