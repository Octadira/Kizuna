export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

export const changelog: ChangelogEntry[] = [
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

export const CURRENT_VERSION = "0.7.0";
