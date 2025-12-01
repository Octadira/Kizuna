export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

export const changelog: ChangelogEntry[] = [
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

export const CURRENT_VERSION = changelog[0].version;
