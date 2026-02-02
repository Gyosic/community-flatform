import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { app } from "@/config";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data/site-settings";
import { MenuGroup, MenuItem } from "@/types";

const getMenu = async () => {
  const res = await fetch(new URL("/api/menu", app.baseurl), { method: "GET" });

  const data = await res.json();
  const { items = [] } = data || {};

  return items;
};
export default async function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettings();
  const siteName = siteSettings?.site_name || "Community";
  const siteDescription = siteSettings?.site_description || "커뮤니티 플랫폼";
  const logo = siteSettings?.logo?.[0] || null;
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

  const menu: MenuItem[] = await getMenu();

  const userMenu: MenuGroup = { label: "메뉴", menu };

  return (
    <SidebarProvider>
      <AppSidebar userMenu={userMenu} user={user} siteName={siteName} logo={logo} />
      <SidebarInset>
        <Header siteName={siteName} user={user} />

        <div className="flex flex-1">
          <main className="flex-1">
            <div className="container h-full p-2">{children}</div>
          </main>
        </div>

        <Footer siteName={siteName} siteDescription={siteDescription} showFooter={showFooter} />
      </SidebarInset>
    </SidebarProvider>
  );
}
