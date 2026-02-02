"use client";

import { ThemeProvider } from "next-themes";

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
  defaultTheme?: "light" | "dark" | "system";
}

export function ThemeProviderWrapper({
  children,
  defaultTheme = "system",
}: ThemeProviderWrapperProps) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
