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
                "flex-1 w-full transition-all duration-300 ease-in-out flex flex-col min-h-screen",
                isCollapsed ? "md:pl-20" : "md:pl-64"
            )}>
                <div className="flex-1 flex flex-col p-4 pt-20 md:p-8 max-w-7xl mx-auto w-full">
                    <div className="flex-1">
                        {children}
                    </div>
                    <footer className="mt-auto pt-10">
                        <div className="py-6 border-t border-border/50">
                            <p className="text-[10px] text-muted-foreground/60 text-center">
                                Not affiliated with n8n or its parent company.
                            </p>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
}
