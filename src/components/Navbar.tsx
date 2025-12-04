"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, Star, LogOut, Menu, X, Settings, Copy } from "lucide-react";
import { Button } from "./ui/Button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import { useState, useEffect } from "react";
import { ChangelogModal } from "./ChangelogModal";
import { CURRENT_VERSION } from "@/lib/changelog";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-md">
                        n8
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
                "fixed top-0 left-0 h-full w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground p-4 flex flex-col z-[50] transition-transform duration-300 ease-in-out md:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="mb-8 px-2 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-md">
                        n8
                    </div>
                    <span className="text-xl font-bold tracking-tight text-sidebar-foreground">Kizuna</span>
                </div>

                <div className="space-y-1 flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                )}
                            >
                                <Icon size={18} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-auto pt-4 border-t border-sidebar-border space-y-2">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-medium text-sidebar-foreground/50">Theme</span>
                        <div className="flex items-center gap-1">
                            <ThemeSwitcher />
                            <ModeToggle />
                        </div>
                    </div>

                    <ChangelogModal>
                        <button className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-left px-2 py-1 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            v{CURRENT_VERSION}
                        </button>
                    </ChangelogModal>

                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                        onClick={handleSignOut}
                    >
                        <LogOut size={18} />
                        Sign Out
                    </Button>
                </div>
            </nav>
        </>
    );
}
