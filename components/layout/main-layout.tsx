"use client";

import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Footer } from "./footer";
import type { Board } from "@/lib/db/schema";

interface MainLayoutProps {
  children: React.ReactNode;
  siteName?: string;
  user?: {
    id: string;
    username: string;
    display_name: string;
    role: string;
  } | null;
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
  user = null,
  boards = [],
  showSidebar = true,
  showFooter = true,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        siteName={siteName}
        user={user}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1">
        {showSidebar && (
          <Sidebar
            boards={boards}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1">
          <div className="container py-8">
            {children}
          </div>
        </main>
      </div>

      <Footer siteName={siteName} showFooter={showFooter} />
    </div>
  );
}
