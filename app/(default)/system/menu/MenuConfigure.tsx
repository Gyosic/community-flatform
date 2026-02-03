"use client";

import { Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { generateChildUrl, getMenuType, MENU_TYPE_LIST } from "@/lib/menu/types";
import { guid } from "@/lib/randomize";
import { menuSchema } from "@/lib/zod/menu";
import { FieldModel, MenuItem } from "@/types";

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

  const menuTypeEnums = useMemo(() => {
    return MENU_TYPE_LIST.reduce(
      (acc, type) => {
        acc[type.label] = type.id;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, []);

  const menuFieldModel = useMemo(() => {
    const isChildMenu = !!selectedMenu?.parent_id;

    const fields: Record<string, FieldModel> = {
      title: {
        name: "제목",
        type: "string",
      },
      icon: {
        name: "아이콘",
        type: "icon",
      },
    };

    if (!isChildMenu) {
      fields.type = {
        name: "타입",
        type: "enum",
        enums: menuTypeEnums,
      };
    }

    fields.hidden = { name: "숨김", type: "boolean" };

    return fields;
  }, [selectedMenu, menuTypeEnums]);

  const handleAddMenu = () => {
    const menu: MenuItem = {
      id: guid({ length: 11 }),
      title: "새 메뉴",
      type: "home",
      url: "/",
    };
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
  }, [menuConfigure]);

  useEffect(() => {
    if (!selectedMenu) return;

    const updateTree = (items: MenuItem[]): MenuItem[] => {
      return items.map((item) => {
        if (item.id === selectedMenu.id) {
          const { children: _, ...selectedWithoutChildren } = selectedMenu;
          return { ...item, ...selectedWithoutChildren };
        }
        if (item.children) {
          return {
            ...item,
            children: updateTree(item.children),
          };
        }
        return item;
      });
    };

    setMenuList((prevMenuList) => updateTree(prevMenuList));
  }, [selectedMenu]);

  const handleFieldChange = (fieldKey: string, value: unknown) => {
    setSelectedMenu((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, [fieldKey]: value } as MenuItem;

      if (fieldKey === "type" && typeof value === "string") {
        const menuType = getMenuType(value);
        if (menuType) {
          updated.title = menuType.label;
          updated.icon = menuType.icon;

          if (menuType.hasChildren) {
            updated.url = undefined;
          } else {
            updated.url = menuType.url || undefined;
          }
        }
      }

      return updated;
    });
  };

  const handleAddChildMenu = (parentId: string, parentMenuType: string) => {
    const menuType = getMenuType(parentMenuType);
    if (!menuType?.hasChildren) return;

    const slug = guid({ length: 11 });
    const url = generateChildUrl(parentMenuType, slug);

    const childMenu: MenuItem = {
      id: guid({ length: 11 }),
      title: "새 하위메뉴",
      parent_id: parentId,
      slug,
      url,
    };

    const addChildToTree = (items: MenuItem[]): MenuItem[] => {
      return items.map((item) => {
        if (item.id === parentId) {
          const children = item.children || [];
          return {
            ...item,
            children: [...children, { ...childMenu, order: children.length }],
          };
        }
        if (item.children) {
          return {
            ...item,
            children: addChildToTree(item.children),
          };
        }
        return item;
      });
    };

    setMenuList((prev) => addChildToTree(prev));
  };

  const handleDeleteMenu = (menuId: string) => {
    const removeFromTree = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter((item) => item.id !== menuId)
        .map((item) => {
          if (item.children) {
            return {
              ...item,
              children: removeFromTree(item.children),
            };
          }
          return item;
        });
    };

    setMenuList(removeFromTree(menuList));
    setSelectedMenu(undefined);
  };

  const renderFields = () => {
    return Object.entries(menuFieldModel).map(([fieldKey, fieldModel]) => (
      <div className="flex" key={fieldKey}>
        <Label className="min-w-20">{fieldModel.name}</Label>
        <TemplateFormItem
          isForm={false}
          fieldModel={fieldModel}
          field={
            {
              value: (selectedMenu as unknown as Record<string, unknown>)?.[fieldKey] ?? "",
              onChange: (v: unknown) => {
                const value =
                  (v as { target?: { value?: string } })?.target?.value ?? (v as string);
                handleFieldChange(fieldKey, value);
              },
              onBlur: () => {},
              name: fieldKey,
              ref: () => {},
            } as unknown as ControllerRenderProps
          }
        />
      </div>
    ));
  };

  const selectedMenuType = selectedMenu?.type ? getMenuType(selectedMenu.type) : null;
  const canAddChild = selectedMenuType?.hasChildren && !selectedMenu?.parent_id;

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
              <DrawerTitle />
              <DrawerContent className="flex flex-col gap-2 p-2">
                {renderFields()}
                {canAddChild && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => handleAddChildMenu(selectedMenu.id, selectedMenu.type!)}
                  >
                    하위메뉴 추가
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteMenu(selectedMenu.id)}
                >
                  삭제
                </Button>
              </DrawerContent>
            </Drawer>
          ) : (
            <div className="flex flex-1 flex-col gap-2 p-2">
              {renderFields()}
              {canAddChild && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddChildMenu(selectedMenu.id, selectedMenu.type!)}
                >
                  하위메뉴 추가
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteMenu(selectedMenu.id)}
              >
                <Trash2 />
                삭제
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
