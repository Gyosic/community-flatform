import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProviderWrapper } from "@/components/providers/ThemeProviderWrapper";
import { Alert } from "@/components/shared/Alert";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings } from "@/lib/data/site-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const siteName = settings?.site_name || "Community";
  const siteDescription = settings?.site_description || "커뮤니티 플랫폼";
  const seoConfig = settings?.seo_config;
  const favicon = settings?.favicon?.[0];
  const ogImage = seoConfig?.og_image?.[0];

  return {
    title: {
      default: seoConfig?.meta_title || `${siteName} - ${siteDescription}`,
      template: `%s | ${siteName}`,
    },
    description: seoConfig?.meta_description || siteDescription,
    keywords: seoConfig?.meta_keywords,
    icons: { icon: favicon?.src ? `/api/files${favicon.src}` : "/favicon.png" },
    openGraph: {
      title: seoConfig?.meta_title || siteName,
      description: seoConfig?.meta_description || siteDescription,
      siteName,
      images: ogImage?.src ? [`/api/files${ogImage.src}`] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const defaultTheme = settings?.theme_config?.default_theme || "system";

  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <ThemeProviderWrapper defaultTheme={defaultTheme}>{children}</ThemeProviderWrapper>
        </SessionProvider>
        <Toaster />
        <LoadingOverlay />
        <Alert />
      </body>
    </html>
  );
}
