import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GeometricBackground } from "@/components/GeometricBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kizuna",
  description: "One Kizuna. All your automation. - Unified n8n Server Manager",
  appleWebApp: {
    title: "Kizuna",
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
