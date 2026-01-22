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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center gap-4">
        {/* 모바일 메뉴 토글 */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuToggle}>
          <Menu className="size-5" />
          <span className="sr-only">메뉴</span>
        </Button>

        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-semibold text-lg">{siteName}</span>
        </Link>

        {/* 네비게이션 */}
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          <Link href="/" className="font-medium text-sm transition-colors hover:text-primary">
            홈
          </Link>
          <Link
            href="/boards"
            className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            게시판
          </Link>
        </nav>

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
    </header>
  );
}
