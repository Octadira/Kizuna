"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Palette } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function ThemeSwitcher() {
    const [enabled, setEnabled] = useState(false);
    const [currentTheme, setCurrentTheme] = useState("mint"); // mint (default) or classic
    const supabase = createClient();

    useEffect(() => {
        // 1. Check if plugin is enabled
        const checkPlugin = async () => {
            const { data } = await supabase
                .from("plugins")
                .select("enabled")
                .eq("key", "theme_switcher")
                .single();

            if (data?.enabled) {
                setEnabled(true);
            }
        };

        checkPlugin();

        // 2. Load saved theme preference
        const savedTheme = localStorage.getItem("n8kizuna-theme-color");
        if (savedTheme) {
            setCurrentTheme(savedTheme);
            applyTheme(savedTheme);
        }
    }, []);

    const toggleTheme = () => {
        const themes = ["mint", "classic", "ocean"];
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const newTheme = themes[nextIndex];

        setCurrentTheme(newTheme);
        localStorage.setItem("n8kizuna-theme-color", newTheme);
        applyTheme(newTheme);
    };

    const applyTheme = (theme: string) => {
        const root = document.documentElement;
        // Remove all theme classes first
        root.classList.remove("theme-classic", "theme-ocean");

        // Add specific theme class if not default (mint)
        if (theme === "classic") {
            root.classList.add("theme-classic");
        } else if (theme === "ocean") {
            root.classList.add("theme-ocean");
        }
    };

    if (!enabled) return null;

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={`Switch Theme (Current: ${currentTheme})`}
            className="h-8 w-8"
        >
            <Palette
                size={18}
                className={
                    currentTheme === 'classic' ? 'text-pink-500' :
                        currentTheme === 'ocean' ? 'text-blue-500' :
                            'text-green-500'
                }
            />
        </Button>
    );
}
