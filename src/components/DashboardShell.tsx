"use client";

import { Navbar } from "@/components/Navbar";
import { useSidebar } from "@/components/SidebarProvider";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="flex min-h-screen">
            <Navbar />
            <main className={cn(
                "flex-1 w-full transition-all duration-300 ease-in-out",
                isCollapsed ? "md:pl-20" : "md:pl-64"
            )}>
                <div className="p-4 pt-20 md:p-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
