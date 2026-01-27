"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { toast } from "sonner";
import { TreeMenu } from "@/app/(default)/system/menu/TreeMenu";
import { TemplateFormItem } from "@/components/form/TemplateFormItem";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { loading } from "@/lib/loading";
import { guid } from "@/lib/randomize";
import { menuSchema } from "@/lib/zod/menu";
import { MenuItem } from "@/types";

export const menuFieldModel = {
  title: {
    name: "제목",
    type: "string",
  },
  icon: {
    name: "아이콘",
    type: "icon",
  },
  url: {
    name: "경로",
    type: "enum",
    enums: {
      "#": "#",
      홈: "/",
      인기글: "/popular",
    },
  },
  hidden: { name: "숨김", type: "boolean", default: false },
};

interface MenuConfigureProps {
  menuConfigure?: {
    id: string;
    items: MenuItem[];
    created_at: string;
    updated_at: string;
  };
}
export default function MenuConfigure({ menuConfigure }: MenuConfigureProps) {
  const router = useRouter();
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem>();
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleAddMenu = () => {
    const menu = { id: guid({ length: 11 }), title: "새 메뉴", url: "#" };

    setMenuList((prev) => [...prev, { ...menu, order: prev.length }]);
  };

  const handleSaveMenu = async () => {
    try {
      loading.show("메뉴 저장하는 중...");
      const body = await menuSchema.parseAsync({ items: menuList });

      if (menuConfigure?.id) {
        Object.assign(body, { id: menuConfigure.id });
        await fetch("/api/menu", { method: "PUT", body: JSON.stringify(body) });
      } else {
        await fetch("/api/menu", { method: "POST", body: JSON.stringify(body) });
      }

      router.refresh();
      toast("저장되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      loading.hide();
    }
  };

  useEffect(() => {
    if (menuConfigure) {
      setMenuList(menuConfigure.items);
    }
    // loading.hide(); // 테스트를 위해 임시로 주석
  }, [menuConfigure]);

  useEffect(() => {
    if (!selectedMenu) return;

    const updateTree = (items: MenuItem[]): MenuItem[] => {
      return items.map((item) => {
        // 현재 아이템이 선택된 메뉴면 업데이트
        if (item.id === selectedMenu.id) {
          // children은 기존 것 유지 (덮어쓰지 않음)
          const { children: _, ...selectedWithoutChildren } = selectedMenu;
          return { ...item, ...selectedWithoutChildren };
        }
        // 자식이 있으면 재귀 탐색
        if (item.children) {
          return {
            ...item,
            children: updateTree(item.children),
          };
        }
        return item;
      });
    };

    // 함수 전달로 항상 최신 menuList 사용
    setMenuList((prevMenuList) => updateTree(prevMenuList));
  }, [selectedMenu]);

  return (
    <div className="flex h-full w-full">
      <div className="flex h-full w-full">
        <div className="flex flex-1 animate-in flex-col border">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm">메뉴 설정</span>
            <div className="flex gap-2 text-xs">
              <Button variant="ghost" type="button" onClick={handleAddMenu}>
                메뉴추가
              </Button>
              <Button variant="ghost" type="button" onClick={handleSaveMenu}>
                <Save />
                저장
              </Button>
            </div>
          </div>
          <Separator className="w-full" />

          <div className="flex flex-col p-2">
            <TreeMenu
              menuList={menuList}
              setMenuList={setMenuList}
              setSelectedMenu={setSelectedMenu}
              setDetailDrawerOpen={setDetailDrawerOpen}
            />
          </div>
        </div>
        {selectedMenu &&
          (isMobile ? (
            <Drawer open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen} direction="right">
              <DrawerTitle></DrawerTitle>
              <DrawerContent className="flex flex-col gap-2 p-2">
                {Object.entries(menuFieldModel).map(([fieldKey, fieldModel], i) => {
                  const typedKey = fieldKey as keyof typeof menuFieldModel;
                  return (
                    <div className="flex" key={fieldKey}>
                      <Label className="min-w-20">{fieldModel.name}</Label>
                      <TemplateFormItem
                        isForm={false}
                        fieldModel={fieldModel}
                        field={
                          {
                            value: selectedMenu[typedKey] ?? "",
                            onChange: (v: unknown) => {
                              const value =
                                (v as { target?: { value?: string } })?.target?.value ??
                                (v as string);
                              setSelectedMenu((prev) => {
                                if (!prev) return prev;
                                return { ...prev, [fieldKey]: value } as MenuItem;
                              });
                            },
                            onBlur: () => {},
                            name: fieldKey,
                            ref: () => {},
                          } as unknown as ControllerRenderProps
                        }
                      ></TemplateFormItem>
                    </div>
                  );
                })}
              </DrawerContent>
            </Drawer>
          ) : (
            <div className="flex flex-1 flex-col gap-2 p-2">
              {Object.entries(menuFieldModel).map(([fieldKey, fieldModel], i) => {
                const typedKey = fieldKey as keyof typeof menuFieldModel;
                return (
                  <div className="flex" key={fieldKey}>
                    <Label className="min-w-20">{fieldModel.name}</Label>
                    <TemplateFormItem
                      isForm={false}
                      fieldModel={fieldModel}
                      field={
                        {
                          value: selectedMenu[typedKey] ?? "",
                          onChange: (v: unknown) => {
                            const value =
                              (v as { target?: { value?: string } })?.target?.value ??
                              (v as string);
                            setSelectedMenu((prev) => {
                              if (!prev) return prev;
                              return { ...prev, [fieldKey]: value } as MenuItem;
                            });
                          },
                          onBlur: () => {},
                          name: fieldKey,
                          ref: () => {},
                        } as unknown as ControllerRenderProps
                      }
                    ></TemplateFormItem>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </div>
  );
}
