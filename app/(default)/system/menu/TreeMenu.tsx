"use client";

import { DndContext, DragEndEvent, DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { map } from "es-toolkit/compat";
import {
  ArrowDown,
  ArrowUp,
  EllipsisVertical,
  GitBranchPlus,
  GripVertical,
  Trash2,
} from "lucide-react";
import { createElement, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useDynamicIcon } from "@/hooks/use-lucide-icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { guid } from "@/lib/randomize";
import { MenuItem } from "@/types";

interface TreeMenuItemProps {
  menu: MenuItem;
  depth?: number;
  addChildMenu?: (menu: MenuItem) => void;
  setSelectedMenu: (menu: MenuItem) => void;
  setDetailDrawerOpen: (open: boolean) => void;
  onChildrenReorder?: (parentId: string, newChildren: MenuItem[]) => void;
  deleteMenu?: (menuId: string) => void;
  onMoveUp?: (menuId: string) => void;
  onMoveDown?: (menuId: string) => void;
}

function TreeMenuItem({
  menu,
  depth = 0,
  addChildMenu,
  setSelectedMenu,
  setDetailDrawerOpen,
  onChildrenReorder,
  deleteMenu,
  onMoveUp,
  onMoveDown,
}: TreeMenuItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const iconComponent = useDynamicIcon(menu.icon);
  const isMobile = useIsMobile();
  const hasChildren = !!menu.children && menu.children.length > 0;

  const handleClickSelectMenu = () => {
    setSelectedMenu(menu);
    setDetailDrawerOpen(true);
  };

  const handleClickAddChild = () => {
    const child = { id: guid({ length: 11 }), title: "새 메뉴", url: "#", parent_id: menu.id };
    addChildMenu?.(child);
  };

  const handleConfirmDelete = () => {
    deleteMenu?.(menu.id);
    setDeleteDialogOpen(false);
    toast(`삭제되었습니다`);
  };

  const handleChildDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !menu.children || active.id === over.id) return;

    const oldIndex = menu.children.findIndex((child) => child.id === active.id);
    const newIndex = menu.children.findIndex((child) => child.id === over.id);

    const newChildren = arrayMove(menu.children, oldIndex, newIndex).map((child, index) => ({
      ...child,
      order: index,
    }));

    onChildrenReorder?.(menu.id, newChildren);
  };

  const renderMenuItem = (
    attributes: DraggableAttributes,
    listeners: SyntheticListenerMap | undefined,
  ) => (
    <>
      <SidebarMenuButton asChild onClick={() => handleClickSelectMenu()}>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            {isMobile ? null : (
              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer p-0"
                {...attributes}
                {...listeners}
              >
                <GripVertical />
              </Button>
            )}
            {iconComponent && createElement(iconComponent, { className: "size-4" })}
            <span>{menu.title}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {isMobile && (
                  <>
                    <DropdownMenuItem
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        onMoveUp?.(menu.id);
                      }}
                    >
                      <ArrowUp className="h-4 w-4" />
                      위로 이동
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        onMoveDown?.(menu.id);
                      }}
                    >
                      <ArrowDown className="h-4 w-4" />
                      아래로 이동
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    handleClickAddChild();
                  }}
                >
                  <GitBranchPlus className="h-4 w-4" />
                  하위 메뉴추가
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    setDeleteDialogOpen(true);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuButton>

      {hasChildren ? (
        <SidebarMenuSub className="me-0 pe-0">
          <DndContext onDragEnd={handleChildDragEnd}>
            <SortableContext
              items={map(menu.children!, ({ id }) => id)}
              strategy={verticalListSortingStrategy}
            >
              {menu.children!.map((child) => (
                <TreeMenuItem
                  key={child.id}
                  menu={child}
                  depth={depth + 1}
                  addChildMenu={addChildMenu}
                  setSelectedMenu={setSelectedMenu}
                  setDetailDrawerOpen={setDetailDrawerOpen}
                  onChildrenReorder={onChildrenReorder}
                  deleteMenu={deleteMenu}
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                />
              ))}
            </SortableContext>
          </DndContext>
        </SidebarMenuSub>
      ) : null}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>메뉴 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{menu.title}" 메뉴를 삭제하시겠습니까?
              {hasChildren && " (하위 메뉴도 함께 삭제됩니다)"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  if (depth === 0) {
    return (
      <SortableItem
        id={menu.id}
        render={({ attributes, listeners }) => (
          <SidebarMenuItem>{renderMenuItem(attributes, listeners)}</SidebarMenuItem>
        )}
      />
    );
  }

  // 하위 레벨 (depth > 0)
  return (
    <>
      <SortableItem
        id={menu.id}
        render={({ attributes, listeners }) => (
          <SidebarMenuSubItem className="me-0 pe-0">
            <SidebarMenuSubButton asChild onClick={(e) => handleClickSelectMenu()}>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  {isMobile ? null : (
                    <Button
                      type="button"
                      variant="ghost"
                      className="cursor-pointer p-0"
                      {...attributes}
                      {...listeners}
                    >
                      <GripVertical />
                    </Button>
                  )}
                  {iconComponent && createElement(iconComponent, { className: "size-4" })}
                  <span>{menu.title}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <EllipsisVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      {isMobile && (
                        <>
                          <DropdownMenuItem
                            onClick={(e: MouseEvent) => {
                              e.stopPropagation();
                              onMoveUp?.(menu.id);
                            }}
                          >
                            <ArrowUp className="h-4 w-4" />
                            위로 이동
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e: MouseEvent) => {
                              e.stopPropagation();
                              onMoveDown?.(menu.id);
                            }}
                          >
                            <ArrowDown className="h-4 w-4" />
                            아래로 이동
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={(e: MouseEvent) => {
                          e.stopPropagation();
                          handleClickAddChild();
                        }}
                      >
                        <GitBranchPlus className="h-4 w-4" />
                        하위 메뉴추가
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e: MouseEvent) => {
                          e.stopPropagation();
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SidebarMenuSubButton>

            {hasChildren ? (
              <SidebarMenuSub className="me-0 pe-0">
                <DndContext onDragEnd={handleChildDragEnd}>
                  <SortableContext
                    items={map(menu.children!, ({ id }) => id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {menu.children!.map((child) => (
                      <TreeMenuItem
                        key={child.id}
                        menu={child}
                        depth={depth + 1}
                        addChildMenu={addChildMenu}
                        setSelectedMenu={setSelectedMenu}
                        setDetailDrawerOpen={setDetailDrawerOpen}
                        onChildrenReorder={onChildrenReorder}
                        deleteMenu={deleteMenu}
                        onMoveUp={onMoveUp}
                        onMoveDown={onMoveDown}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </SidebarMenuSub>
            ) : null}
          </SidebarMenuSubItem>
        )}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>메뉴 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{menu.title}" 메뉴를 삭제하시겠습니까?
              {hasChildren && " (하위 메뉴도 함께 삭제됩니다)"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface TreeMenuProps {
  menuList: MenuItem[];
  setMenuList: (menu: MenuItem[]) => void;
  setSelectedMenu: (menu: MenuItem) => void;
  setDetailDrawerOpen: (open: boolean) => void;
}

export function TreeMenu({
  menuList,
  setMenuList,
  setSelectedMenu,
  setDetailDrawerOpen,
}: TreeMenuProps) {
  const addChildMenu = (child: MenuItem) => {
    const addToTree = (items: MenuItem[]): MenuItem[] => {
      return items.map((item) => {
        // 현재 아이템이 부모면 children에 추가
        if (item.id === child.parent_id) {
          return {
            ...item,
            children: [...(item.children || []), child],
          };
        }
        // 자식이 있으면 재귀 탐색
        if (item.children) {
          return {
            ...item,
            children: addToTree(item.children),
          };
        }
        return item;
      });
    };

    setMenuList(addToTree(menuList));
  };

  const handleChildrenReorder = (parentId: string, newChildren: MenuItem[]) => {
    const updateTree = (items: MenuItem[]): MenuItem[] => {
      return items.map((item) => {
        // 현재 아이템이 부모면 children 교체
        if (item.id === parentId) {
          return {
            ...item,
            children: newChildren,
          };
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

    setMenuList(updateTree(menuList));
  };

  const deleteMenu = (menuId: string) => {
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
  };

  const handleMoveUp = (menuId: string) => {
    const moveUpInTree = (items: MenuItem[]): MenuItem[] => {
      const index = items.findIndex((item) => item.id === menuId);
      if (index > 0) {
        const newItems = [...items];
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        return newItems.map((item, idx) => ({ ...item, order: idx }));
      }

      return items.map((item) => {
        if (item.children) {
          return {
            ...item,
            children: moveUpInTree(item.children),
          };
        }
        return item;
      });
    };

    setMenuList(moveUpInTree(menuList));
  };

  const handleMoveDown = (menuId: string) => {
    const moveDownInTree = (items: MenuItem[]): MenuItem[] => {
      const index = items.findIndex((item) => item.id === menuId);
      if (index >= 0 && index < items.length - 1) {
        const newItems = [...items];
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        return newItems.map((item, idx) => ({ ...item, order: idx }));
      }

      return items.map((item) => {
        if (item.children) {
          return {
            ...item,
            children: moveDownInTree(item.children),
          };
        }
        return item;
      });
    };

    setMenuList(moveDownInTree(menuList));
  };

  const handleMenuDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      // active.id와 over.id로 배열 인덱스 찾기
      const oldIndex = menuList.findIndex((menu) => menu.id === active.id);
      const newIndex = menuList.findIndex((menu) => menu.id === over.id);

      // 순서 변경 후 상태 업데이트
      const newList = arrayMove(menuList, oldIndex, newIndex);

      // order 필드 업데이트 (선택사항)
      const updatedList = newList.map((menu, index) => ({
        ...menu,
        order: index,
      }));

      setMenuList(updatedList);
    }
  };

  return (
    <SidebarMenu>
      <DndContext onDragEnd={handleMenuDragEnd}>
        <SortableContext
          items={map(menuList, ({ id }) => id)}
          strategy={verticalListSortingStrategy}
        >
          {menuList.map((menu) => (
            <TreeMenuItem
              key={menu.id}
              menu={menu}
              addChildMenu={addChildMenu}
              setSelectedMenu={setSelectedMenu}
              setDetailDrawerOpen={setDetailDrawerOpen}
              onChildrenReorder={handleChildrenReorder}
              deleteMenu={deleteMenu}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </SortableContext>
      </DndContext>
    </SidebarMenu>
  );
}

const SortableItem = ({
  id,
  children,
  render,
}: {
  id: string;
  children?: React.ReactNode;
  render?: ({
    attributes,
    listeners,
  }: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
  }) => React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: "none",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {render ? render({ attributes, listeners }) : children}
    </div>
  );
};
