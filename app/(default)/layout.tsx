import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { app } from "@/config";
import { auth } from "@/lib/auth";
import { MenuGroup, MenuItem } from "@/types";

export default async function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteName = "Community";
  const showFooter = true;
  const session = await auth();

  // 세션이 있으면 user 객체 생성
  const user = session
    ? {
        id: session?.user.id ?? "",
        name: session?.user.name ?? "",
        role: session?.user.role ?? "",
        email: session?.user.email ?? "",
        avatar: "",
      }
    : undefined;

  const res = await fetch(new URL("/api/menu", app.baseurl), { method: "GET" });
  const { _id, items } = await res.json();

  const userMenu: MenuGroup = { label: "메뉴", menu: items as MenuItem[] };

  return (
    <SidebarProvider>
      <AppSidebar userMenu={userMenu} user={user} />
      <SidebarInset>
        <Header siteName={siteName} user={user} />

        <div className="flex flex-1">
          <main className="flex-1">
            <div className="container h-full p-2">{children}</div>
          </main>
        </div>

        <Footer siteName={siteName} showFooter={showFooter} />
      </SidebarInset>
    </SidebarProvider>
  );
}
