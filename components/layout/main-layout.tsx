"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Board } from "@/lib/db/schema";
import { Footer } from "./footer";
import { Header } from "./Header";
import { Sidebar } from "./sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  siteName?: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
  boards?: Board[];
  showSidebar?: boolean;
  showFooter?: boolean;
}

/**
 * Content Layout - 사용자 UI 전용
 * CLAUDE.md 규칙: 읽기 중심, 시선 흐름 위→아래
 */
export function MainLayout({
  children,
  siteName = "Community",
  user,
  boards = [],
  showSidebar = true,
  showFooter = true,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header siteName={siteName} user={user} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex flex-1">
          <main className="flex-1">
            <div className="container py-8">{children}</div>
          </main>
        </div>

        <Footer siteName={siteName} showFooter={showFooter} />
      </SidebarInset>
    </SidebarProvider>
  );
}
