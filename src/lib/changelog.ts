export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

export const changelog: ChangelogEntry[] = [
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

export const CURRENT_VERSION = "0.2.1";
