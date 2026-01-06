import type { Metadata } from "next";
import React from "react";

export const BRANDING = {
    appName: "Kizuna",
    companyName: "Octadira",
    tagline: "One Kizuna. All your automation.",
    description: "Unified n8n Server Manager",
    // Default metadata for the app
    metadata: {
        title: {
            default: "Kizuna",
            template: "%s | Kizuna"
        },
        description: "Unified n8n Server Manager - monitor and manage your workflows.",
        icons: {
            icon: "/favicon.ico",
            apple: "/apple-icon.png",
        }
    } as Metadata
};

/**
 * The main logo component.
 * We export this as a component to allow for dynamic coloring (currentColor)
 * and easy replacement.
 */
export const BrandLogo = ({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        fill="currentColor"
        className={className}
        {...props}
    >
        {/* Placeholder 'K' logo matching the uploaded image style approximately. 
        User can replace this path with their exact SVG path. 
    */}
        <path d="M20 10 A 10 10 0 0 0 10 20 V 80 A 10 10 0 0 0 30 80 V 55 L 60 85 A 10 10 0 0 0 75 70 L 45 40 L 75 10 A 10 10 0 0 0 60 -5 L 30 25 V 20 A 10 10 0 0 0 20 10 Z" />
        <circle cx="85" cy="85" r="8" />
    </svg>
);
