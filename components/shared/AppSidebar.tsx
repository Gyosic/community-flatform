"use client";

import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useMemo } from "react";
import { NavMain } from "@/components/shared/NavMain";
// import { NavMain } from "@/components/nav-main";
// import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/shared/NavUser";
// import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { FileType } from "@/lib/zod/file";
import { MenuGroup } from "@/types";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userMenu: MenuGroup;
  user?: {
    email: string;
    name: string;
    avatar: string;
    role?: string;
  };
  siteName?: string;
  logo?: FileType | null;
}

const ADMIN_ROLES = ["sysadmin", "admin"];

export function AppSidebar({
  userMenu,
  user,
  siteName = "Community",
  logo,
  ...props
}: AppSidebarProps) {
  const isAdmin = user?.role && ADMIN_ROLES.includes(user.role);

  const systemMenuGroup: MenuGroup = {
    label: "시스템",
    menu: [
      {
        id: "system_settings",
        title: "환경설정",
        url: "/system/settings",
        icon: "Settings",
      },
      {
        id: "system_menu",
        title: "메뉴관리",
        url: "/system/menu",
        icon: "SquareMenu",
      },
      {
        id: "system_boards",
        title: "게시판관리",
        url: "/system/boards",
        icon: "Layout",
      },
      {
        id: "system_page",
        title: "페이지관리",
        url: "/system/page",
        icon: "Wallpaper",
      },
      {
        id: "system_theme",
        title: "테마관리",
        url: "/system/theme",
        icon: "Palette",
      },
      {
        id: "system_role",
        title: "역할관리",
        url: "/system/role",
        icon: "PersonStanding",
      },
      {
        id: "system_user",
        title: "사용자관리",
        url: "/system/user",
        icon: "UserCog",
      },
    ],
  };

  const menu = useMemo<MenuGroup[]>(() => {
    if (isAdmin) return [userMenu, systemMenuGroup];

    return [userMenu];
  }, [userMenu, isAdmin]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                {logo?.src ? (
                  <Image
                    src={`/api/files${logo.src}`}
                    alt={siteName}
                    width={32}
                    height={32}
                    className="size-8 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <GalleryVerticalEnd className="size-4" />
                  </div>
                )}
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">{siteName}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menu} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
