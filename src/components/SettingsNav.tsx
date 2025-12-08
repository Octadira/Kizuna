"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Puzzle, Github } from "lucide-react";

export function SettingsNav() {
    const pathname = usePathname();

    const items = [
        { href: "/settings/plugins", label: "Plugins", icon: Puzzle },
        { href: "/settings/github", label: "GitHub", icon: Github },
    ];

    return (
        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                            isActive
                                ? "bg-accent text-accent-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                    >
                        <Icon size={18} />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
