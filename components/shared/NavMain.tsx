"use client";

import { ChevronRight } from "lucide-react";
import { createElement } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useDynamicIcon } from "@/hooks/use-lucide-icon";
import { MenuItem } from "@/types";

interface TreeMenuItemProps {
  menu: MenuItem;
  depth?: number;
}

function TreeMenuItem({ menu, depth = 0 }: TreeMenuItemProps) {
  const iconComponent = useDynamicIcon(menu.icon);
  const hasChildren = !!menu.children && menu.children.length > 0;

  if (depth === 0) {
    // 최상위 레벨
    return (
      <SidebarMenuItem>
        <SidebarMenuButton>
          {iconComponent && createElement(iconComponent, { className: "size-4" })}
          <span>{menu.title}</span>
        </SidebarMenuButton>

        {hasChildren ? (
          <SidebarMenuSub>
            {menu.children!.map((child) => (
              <TreeMenuItem key={child.id} menu={child} depth={depth + 1} />
            ))}
          </SidebarMenuSub>
        ) : null}
      </SidebarMenuItem>
    );
  }

  // 하위 레벨 (depth > 0)
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton>
        {iconComponent && createElement(iconComponent, { className: "size-4" })}
        <span>{menu.title}</span>
        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
      </SidebarMenuSubButton>

      {hasChildren ? (
        <SidebarMenuSub>
          {menu.children!.map((child) => (
            <TreeMenuItem key={child.id} menu={child} depth={depth + 1} />
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuSubItem>
  );
}

interface TreeMenuProps {
  menuList: MenuItem[];
}

export function TreeMenu({ menuList }: TreeMenuProps) {
  return (
    <SidebarMenu>
      {menuList.map((menu) => (
        <TreeMenuItem key={menu.id} menu={menu} />
      ))}
    </SidebarMenu>
  );
}

interface NavMainProps {
  items: {
    label: string;
    menu: MenuItem[];
  }[];
}

export function NavMain({ items }: NavMainProps) {
  return (
    <>
      {items.map(({ label, menu }, i) => {
        return (
          <SidebarGroup key={i}>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <TreeMenu menuList={menu}></TreeMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
}
