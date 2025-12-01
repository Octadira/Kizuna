export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

export const changelog: ChangelogEntry[] = [
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

export const CURRENT_VERSION = changelog[0].version;
