import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GeometricBackground } from "@/components/GeometricBackground";

const inter = Inter({ subsets: ["latin"] });

import { BRANDING } from "@/config/branding";

export const metadata: Metadata = {
  title: BRANDING.metadata.title,
  description: BRANDING.metadata.description,
  icons: BRANDING.metadata.icons,
  robots: {
    index: false,
    follow: false,
  },
  appleWebApp: {
    title: BRANDING.appName,
  },
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <GeometricBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
