"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, Star, LogOut, Menu, X, Settings, Copy, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "./ui/Button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import { useState, useEffect } from "react";
import { ChangelogModal } from "./ChangelogModal";
import { CURRENT_VERSION } from "@/lib/changelog";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useSidebar } from "./SidebarProvider";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isCollapsed, toggleSidebar } = useSidebar();

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const navItems = [
        { name: "Servers", href: "/", icon: LayoutGrid },
        { name: "Favorites", href: "/favorites", icon: Star },
        { name: "Templates", href: "/templates", icon: Copy },
        { name: "Settings", href: "/settings/plugins", icon: Settings },
    ];

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="logo-container flex items-center justify-center">
                        <img
                            src="/kizuna-logo-sm.webp"
                            alt="Kizuna Logo"
                            className="h-7 w-auto"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">Kizuna</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[45] md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <nav className={cn(
                "fixed top-0 left-0 h-full border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col z-[50] transition-all duration-300 ease-in-out md:translate-x-0 overflow-hidden",
                isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full",
                // On desktop (md), use dynamic width. On mobile, usually fixed width or handled by transform.
                // We keep w-64 for mobile drawer, but for desktop we switch.
                "md:translate-x-0",
                isCollapsed ? "md:w-20" : "md:w-64"
            )}>
                <div className={cn("mb-6 flex items-center gap-2 h-16 px-4", isCollapsed ? "md:justify-center md:px-2" : "justify-between")}>
                    {/* Full Logo - hidden on desktop if collapsed */}
                    <div className={cn(
                        "flex items-center gap-2 overflow-hidden whitespace-nowrap",
                        isCollapsed ? "md:hidden" : "flex"
                    )}>
                        <div className="logo-container flex items-center justify-center">
                            <img
                                src="/kizuna-logo-sm.webp"
                                alt="Kizuna Logo"
                                className="h-7 w-auto"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-sidebar-foreground transition-opacity duration-300">Kizuna</span>
                    </div>

                    {/* Icon Only Logo - visible only on desktop if collapsed */}
                    <div className={cn("logo-container hidden", isCollapsed && "md:flex md:items-center md:justify-center")}>
                        <img
                            src="/kizuna-logo-sm.webp"
                            alt="Kizuna Logo"
                            className="h-7 w-auto"
                        />
                    </div>

                    {/* Desktop Toggle Button - visible only when NOT collapsed */}
                    {!isCollapsed && (
                        <button
                            onClick={toggleSidebar}
                            className="hidden md:flex items-center justify-center h-8 w-8 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                        >
                            <PanelLeftClose size={18} />
                        </button>
                    )}
                </div>

                {/* Collapsed Toggle Button (Centered if collapsed) */}
                <div className={cn("hidden md:flex mb-4", isCollapsed ? "justify-center px-3" : "justify-end px-2")}>
                    {isCollapsed && (
                        <button
                            onClick={toggleSidebar}
                            className="flex items-center justify-center w-full py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group"
                        >
                            <PanelLeftOpen size={20} className="text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
                        </button>
                    )}
                </div>


                <div className="space-y-1 flex-1 px-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                    isCollapsed && "md:justify-center md:px-2 md:gap-0"
                                )}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon size={20} className="min-w-[20px]" />
                                <span className={cn(
                                    "whitespace-nowrap transition-all duration-300 overflow-hidden",
                                    isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
                                )}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-auto pt-4 border-t border-sidebar-border space-y-2 px-3 pb-4">
                    <div className={cn("flex items-center justify-between", isCollapsed ? "md:flex-col md:gap-4" : "")}>
                        <span className={cn("text-xs font-medium text-sidebar-foreground/50", isCollapsed ? "md:hidden" : "block")}>Theme</span>
                        <div className={cn("flex items-center gap-1", isCollapsed ? "md:flex-col" : "")}>
                            <ThemeSwitcher />
                            <ModeToggle />
                        </div>
                    </div>

                    <ChangelogModal>
                        <button className={cn(
                            "w-full text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 py-1",
                            isCollapsed ? "md:justify-center" : "text-left"
                        )}>
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 min-w-[6px]" />
                            <span className={cn(
                                "overflow-hidden whitespace-nowrap",
                                isCollapsed ? "md:w-0 md:opacity-0 md:hidden" : "w-auto opacity-100"
                            )}>
                                v{CURRENT_VERSION}
                            </span>
                        </button>
                    </ChangelogModal>

                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 dark:hover:text-red-400 dark:hover:bg-red-900/20",
                            isCollapsed && "md:justify-center md:px-0"
                        )}
                        onClick={handleSignOut}
                        title={isCollapsed ? "Sign Out" : undefined}
                    >
                        <LogOut size={18} />
                        <span className={cn(isCollapsed ? "md:hidden" : "block")}>Sign Out</span>
                    </Button>
                </div>
            </nav>
        </>
    );
}
