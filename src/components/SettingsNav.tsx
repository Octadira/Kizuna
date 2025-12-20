"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Puzzle, Github, Settings } from "lucide-react";


export function SettingsNav() {
    const pathname = usePathname();

    const items = [
        { href: "/settings/plugins", label: "Plugins", icon: Puzzle },
        { href: "/settings/github", label: "GitHub Integration", icon: Github },
    ];

    return (
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                <Settings size={14} />
                Configuration
            </div>

            {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                            isActive
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <Icon size={18} className={cn(isActive && "text-primary")} />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

