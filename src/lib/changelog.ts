export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

export const changelog: ChangelogEntry[] = [
    {
        version: "0.13.2",
        date: "2025-12-23",
        changes: [
            "Bug Fix: Resolved React hydration mismatch error on User Management page caused by locale date formatting",
            "Performance: Reduced client-side rendering overhead for date displays"
        ]
    },
    {
        version: "0.13.1",
        date: "2025-12-23",
        changes: [
            "Config: Implemented strict SEO blocking (noindex, nofollow) for production deployments",
            "Config: Added robots.txt generator to disallow all crawlers",
            "Documentation: Added comprehensive 'Vercel Deployment Guide' (docs/vercel-workflow.md)",
            "Documentation: Updated README with deployment privacy rationale"
        ]
    },
    {
        version: "0.13.0",
        date: "2025-12-23",
        changes: [
            "Feature: Added Admin 'Manage Users' panel (Invite, List, Delete users)",
            "Feature: Added 'My Profile' page for managing personal details and password",
            "Security: Implemented Service Role Key based admin operations for enhanced security",
            "UI/UX: Added persistent User Widget in Sidebar with avatar and quick profile access",
            "UI/UX: Moved 'Not Affiliated' disclaimer to a sticky footer in the main layout",
            "Config: Updated setup documentation for Admin role configuration"
        ]
    },
    {
        version: "0.12.0",
        date: "2025-12-20",
        changes: [
            "UI/UX: Added pagination (6 servers/page) and real-time search to dashboard for better scalability",
            "UI/UX: Added pagination (10 workflows/page) and global search filtering to server detail pages",
            "Settings: Complete redesign of the Settings area with a modern two-column layout",
            "Settings: Added pagination and search functionality for Plugins",
            "Refactor: Converted dashboard grids to client-side components for instant interaction"
        ]
    },
    {
        version: "0.11.0",
        date: "2025-12-18",
        changes: [
            "Design: Major UI overhaul to 'Shadow/Zinc' aesthetic for a premium, clean look distinct from n8n",
            "Design: Updated default 'Dark' theme to use Zinc 950/900 palette (previously Slate) for deeper contrast",
            "UX/Legal: Added clear 'Not affiliated with n8n' disclaimers in Sidebar and Login footer",
            "Config: Changed default theme preference to 'Dark' for new users",
            "Styles: Refined global shadows and card backgrounds for better depth in dark mode"
        ]
    },
    {
        version: "0.10.0",
        date: "2025-12-17",
        changes: [
            "Feature: Comprehensive Workflow Version Control System (W-VCS)",
            "Feature: 'Save Version' with custom naming/description for better version identification",
            "Feature: Restore any previous workflow version directly to n8n with one click",
            "Feature: Download specific version snapshots as JSON",
            "UI: Updated terminology to match n8n 2.x (Published/Unpublished instead of Active/Inactive)",
            "Fix: Strict data sanitization during restore to prevent n8n API validation errors"
        ]
    },
    {
        version: "0.9.1",
        date: "2025-12-17",
        changes: [
            "UI Fix: Resolved duplicate logo display in Sidebar and Login page",
            "UI Fix: Corrected icon misalignment in collapsed sidebar state by removing ghost gaps",
            "Styles: Refactored logo container styles to improved utility classes"
        ]
    },
    {
        version: "0.9.0",
        date: "2025-12-17",
        changes: [
            "Performance: True parallel server loading via dedicated API routes",
            "Performance: Each server card now loads independently - slow servers don't block others",
            "Performance: Reduced n8n API timeout from 8s to 3s for faster failure detection",
            "Performance: Skipped version check on server list (only shown on detail page)",
            "Architecture: New /api/server-status endpoint for non-blocking status fetching",
            "Fix: Resolved Next.js server action serialization causing sequential loading"
        ]
    },
    {
        version: "0.8.2",
        date: "2025-12-10",
        changes: [
            "Cleanup: Removed archive/unarchive functionality (API limitations)",
            "Cleanup: Removed unused archiving functions from codebase",
            "Documentation: Added 'Known Issues' section to README",
            "Fix: Case-insensitive tag matching for archived workflow detection"
        ]
    },
    {
        version: "0.8.1",
        date: "2025-12-10",
        changes: [
            "Performance: Switched dashboard server loading from batch to individual streams for instant partial rendering",
            "Performance: Eliminated 'waterfall' loading effect on dashboard",
            "Code Cleanup: Removed deprecated batch fetching logic from actions",
            "Refactor: Simplified ServerCard state management"
        ]
    },
    {
        version: "0.8.0",
        date: "2025-12-09",
        changes: [
            "New Plugin: 'Animated Background' - Geometric particle network background (Toggleable)",
            "Visual: Implemented global animated background for enhanced aesthetics",
            "UX Improved: Auto-refresh on visual plugin toggle for instant feedback",
            "Logic: Theme Switcher now reverts to default 'Mint' theme when disabled",
            "UI: Updated Login page with new dynamic background and version display"
        ]
    },
    {
        version: "0.7.0",
        date: "2025-12-09",
        changes: [
            "New Feature: Collapsible Sidebar with memory state for improved workspace",
            "Performance: Dashboard server cards now load status independently (non-blocking)",
            "Performance: Parallelized n8n status fetching (Workflows + Version check)",
            "UX Improved: Added latency indicator (ms) to server cards",
            "UX Improved: Added skeleton/blur loading states for better perceived performance",
            "UX Improved: Responsive sidebar behavior with optimized mobile drawer"
        ]
    },
    {
        version: "0.6.0",
        date: "2025-12-08",
        changes: [
            "New Feature: 'Push to GitHub' integration for workflows",
            "New Feature: Dedicated 'Archived / Inactive' workflows tab view",
            "New Feature: Ghost mode visual distinction for inactive workflows",
            "New Feature: GitHub Settings configuration with secure PAT storage",
            "Improved: Workflow list layout with filtering tabs",
            "Security: Commit messages via secure modal dialog"
        ]
    },
    {
        version: "0.5.1",
        date: "2025-12-08",
        changes: [
            "CRITICAL SECURITY FIX: Updated Next.js to v16.0.7 to patch React2Shell (CVE-2025-55182)",
            "Dependency updates for security compliance"
        ]
    },
    {
        version: "0.5.0",
        date: "2025-12-08",
        changes: [
            "Added n8n version detection on server detail page",
            "Shows 'Update Available' badge when newer n8n version exists",
            "Smart version extraction from Sentry config for proxied instances",
            "Added tagline: 'One Kizuna. All your automation.'",
            "Code cleanup and interface optimization"
        ]
    },
    {
        version: "0.4.0",
        date: "2025-12-04",
        changes: [
            "Delete Server: Added backup download option before deletion",
            "Smart backup detection: Only shows download option if backups exist",
            "Added HEAD endpoint for efficient backup existence check",
            "Completed comprehensive Security Audit (Score: 9.2/10)",
            "Code cleanup: Removed debug console.log statements",
            "Simplified ServerCard component for better performance"
        ]
    },
    {
        version: "0.3.1",
        date: "2025-12-04",
        changes: [
            "Added ability to delete servers with confirmation dialog",
        ]
    },
    {
        version: "0.3.0",
        date: "2025-12-04",
        changes: [
            "Added new default 'Mint' theme",
            "Added 'Theme Switcher' plugin (Mint, Classic, Ocean)",
            "Implemented Role-Based Access Control (RBAC) for plugin management",
            "Added SSRF protection for server URL validation",
            "Updated UI with fresh colors and shadows"
        ]
    },
    {
        version: "0.2.2",
        date: "2025-12-04",
        changes: [
            "Optimized Workflow Page load time by lazy-loading full workflow JSON",
            "Improved Server Page performance by disabling detailed workflow fetching",
            "Reduced initial payload size for workflow details"
        ]
    },
    {
        version: "0.2.1",
        date: "2025-12-04",
        changes: [
            "Optimized Row Level Security (RLS) policies for better performance",
            "Fixed duplicate policy warnings in database schema",
            "Enhanced database setup script"
        ]
    },
    {
        version: "0.2.0",
        date: "2025-12-02",
        changes: [
            "Added Plugin System for modular feature management",
            "Added Workflow Templates: Save and deploy workflows across servers",
            "Added Cross-Server Cloning: Directly copy workflows between servers",
            "Added Private Notes for workflows",
            "Added Workflow Backups (JSON storage + metadata)",
            "Added Execution Details Viewer (JSON inspector)",
            "Added Advanced Search and Filtering for workflows",
            "Improved Webhook Helper with copy-to-clipboard",
            "Security improvements and bug fixes"
        ]
    },
    {
        version: "0.1.1",
        date: "2025-12-01",
        changes: [
            "Fixed mobile menu closing immediately upon opening",
            "Added page transition progress bar",
            "Added password visibility toggle to login page",
            "Improved Sign Out button visibility in dark mode",
            "Added version display and changelog modal"
        ]
    },
    {
        version: "0.1.0",
        date: "2025-12-01",
        changes: [
            "Initial release",
            "Multi-server management",
            "Workflow monitoring and analytics",
            "Favorites system",
            "Dark/Light mode support",
            "Secure authentication with Supabase"
        ]
    }
];

export const CURRENT_VERSION = "0.13.2";
