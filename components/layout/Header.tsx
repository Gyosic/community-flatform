"use client";

import { Bell, LogOut, Menu, Search, Settings, User } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HeaderProps {
  siteName?: string;
  onMenuToggle?: () => void;
  user?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export function Header({ siteName = "Community", onMenuToggle, user }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center justify-between gap-2 px-4">
        <div className="flex">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        </div>

        <div className="flex items-center gap-2">
          {/* 검색 */}
          <div className="flex-1 md:w-64 md:flex-initial">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" placeholder="검색..." className="pl-10" />
            </div>
          </div>

          {/* 사용자 영역 */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="icon">
                  <Bell className="size-5" />
                  <span className="sr-only">알림</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="size-5" />
                      <span className="sr-only">사용자 메뉴</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-sm">{user.name}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">내 프로필</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">설정</Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Settings className="mr-2 size-4" />
                            관리자 페이지
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => signOut()}>
                      <LogOut className="mr-2 size-4" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">로그인</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">회원가입</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
