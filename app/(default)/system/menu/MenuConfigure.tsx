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
import { guid } from "@/lib/randomize";
import { loading } from "@/lib/store/loading";
import { menuSchema } from "@/lib/zod/menu";
import { FieldModel, MenuItem } from "@/types";

interface Board {
  id: string;
  name: string;
  slug: string;
  type: string;
}

interface MenuConfigureProps {
  menuConfigure?: {
    id: string;
    items: MenuItem[];
    created_at: string;
    updated_at: string;
  };
  baseurl: string;
}

export default function MenuConfigure({ menuConfigure, baseurl }: MenuConfigureProps) {
  const router = useRouter();
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem>();
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch(new URL("/api/pages", baseurl))
      .then((res) => res.json())
      .then((data) => setBoards(data))
      .catch(console.error);
  }, []);

  const boardEnums = useMemo(() => {
    return boards.reduce(
      (acc, board) => {
        acc[board.name] = board.id;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [boards]);

  const menuFieldModel = useMemo(() => {
    const fields: Record<string, FieldModel> = {
      title: {
        name: "제목",
        type: "string",
      },
      icon: {
        name: "아이콘",
        type: "icon",
      },
      board_id: {
        name: "게시판",
        type: "enum",
        enums: boardEnums,
      },
      hidden: {
        name: "숨김",
        type: "boolean",
      },
    };

    return fields;
  }, [boardEnums]);

  const handleAddMenu = () => {
    const menu: MenuItem = {
      id: guid({ length: 11 }),
      title: "새 메뉴",
      url: "#",
    };
    setMenuList((prev) => [...prev, { ...menu, order: prev.length }]);
  };

  const handleSaveMenu = async () => {
    try {
      loading.show("메뉴 저장하는 중...");

      const body = await menuSchema.parseAsync({ items: menuList });

      if (menuConfigure?.id) {
        Object.assign(body, { id: menuConfigure.id });
        await fetch(new URL("/api/menu", baseurl), { method: "PUT", body: JSON.stringify(body) });
      } else {
        await fetch(new URL("/api/menu", baseurl), { method: "POST", body: JSON.stringify(body) });
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

      if (fieldKey === "board_id" && typeof value === "string") {
        const board = boards.find((b) => b.id === value);
        if (board) {
          updated.title = board.name;
          updated.url = `/boards/${board.slug}`;
        }
      }

      return updated;
    });
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
