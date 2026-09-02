import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/context";
import { I18nProvider } from "@/lib/i18n/context";

export const metadata: Metadata = {
  title: "Ostan — Enterprise Business Management System",
  description: "Secure, scalable internal company management platform for employees, tasks, inventory, and operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <ThemeProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
