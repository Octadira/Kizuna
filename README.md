# Kizuna - One Kizuna. All your automation.

![Version](https://img.shields.io/badge/version-0.16.0-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Security Rating](https://img.shields.io/badge/security-9.2%2F10-brightgreen)
<br/>
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-block?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)

![Kizuna Dashboard](public/hero-v2.png)

## Unlock the Full Potential of Your Automation Infrastructure

**Kizuna** is the centralized control plane for your n8n ecosystem. Designed for power users and DevOps teams, it bridges the gap between scattered n8n instances, offering a unified interface for monitoring, management, and secure orchestration.

Stop juggling multiple tabs and credentials. With Kizuna, you gain a "single pane of glass" visibility into your entire automation landscape, ensuring your workflows are always running, secure, and optimized.

[**📚 Read the Full Documentation**](https://kizuna.website/guides/introduction/)

---

## Key Features

### 🚀 Centralized Management
*   **Multi-Server Dashboard:** Monitor the health and status of unlimited n8n instances from one view.
*   **Lightning Fast Loading:** Optimized non-blocking dashboard with individual server status streaming.
*   **True Parallel Loading:** Each server card loads independently - slow servers don't block others.
*   **Real-Time Analytics:** Track active workflows, execution counts, server latency, and uptime instantly.
*   **n8n Version Detection:** See the running n8n version and get notified when updates are available.
*   **Delete Server with Backup:** Safely remove servers with optional backup download.
*   **Server Connection Logs:** Comprehensive logging of all connection attempts with filtering, error diagnosis, and auto-cleanup (30-day retention).

### ⚡ Seamless Orchestration
*   **Collapsible Sidebar:** Smart workspace management with persistent layout preference stored locally in your browser.
*   **Advanced Version Control (W-VCS):** Enterprise-grade versioning for n8n workflows. Save unlimited named versions ("snapshots") of any workflow, download them as JSON, or **restore** them instantly with one click.
    > **The Ultimate Safety Net:** While n8n's native history lives on your n8n server, Kizuna stores your workflow snapshots in your own Supabase instance—completely separate from n8n. This provides a secure external backup layer, ensuring zero data loss even if your n8n instance crashes, is reset, or migrated. Your data stays under your control.
*   **Cross-Server Cloning:** Copy workflows directly from one server to another with a single click.
*   **Workflow Templates:** Save your best workflows as templates and deploy them anywhere.
*   **GitHub Integration:** Direct "Push to GitHub" for workflow versioning with commit messages.

### 🛡️ Security & Isolation
*   **User Levels:** Two-tier role system:
    - **Admin**: Full access including plugin management (enable/disable features).
    - **User**: Standard access with personal workspace isolation.
*   **Row-Level Security (RLS):** Each user sees only their own servers, workflows, and data. Complete data isolation enforced at the database level via Supabase RLS policies.
*   **Secure Credential Storage:** Industry-standard AES-256 encryption for all API keys.
*   **SSRF Protection:** Built-in safeguards against Server-Side Request Forgery attacks.
*   **Security Audit:** Comprehensive security review (Score: 9.2/10).

### 🎨 Personalized Experience
*   **Plugin System:** Extend functionality with modular plugins.
*   **Theme Engine:** Choose your vibe with built-in themes (Mint, Classic, Ocean) and Dark/Light mode support.
*   **Private Notes:** Attach context and documentation directly to your workflows.
*   **Activity Log:** View your action history with filters, pagination, and admin oversight capabilities.

### 🔍 Diagnostics & Troubleshooting
*   **Connection Logs Dashboard:** Global and per-server views of all connection attempts (successful and failed).
*   **Smart Error Classification:** Auto-categorized error types (TIMEOUT, NETWORK_ERROR, AUTH_ERROR, SSL_ERROR, etc.).
*   **Advanced Filtering:** Filter by success/failure, date ranges, with auto-refresh support (30s intervals).
*   **Delete Logs:** Clean up old logs with date range filtering or bulk deletion with confirmation dialogs.
*   **Response Time Tracking:** Color-coded performance indicators (green <1s, amber <3s, red >3s).

---

## Getting Started

### Prerequisites
*   Node.js 18+
*   Supabase project (or local instance)

### Installation

You can either download the latest stable release or clone the repository directly.

#### Option A: Download Latest Release (Stable)
1.  Go to the [**Releases Page**](https://github.com/octadira/kizuna/releases).
2.  Download the **Source code (zip)** or **Source code (tar.gz)** for the latest version.
3.  Extract the archive and navigate into the folder:
    ```bash
    cd kizuna-0.12.0  # Folder name may vary based on release version
    ```

#### Option B: Clone Repository (Latest Dev)
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/octadira/kizuna.git
    cd kizuna
    ```


### Setup & Configuration

Once you have the code (via Release or Git):

1.  **Install dependencies:**
    ```bash
    npm install
    ```


2.  **Environment Setup:**
    Create a `.env.local` file with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    
    # Required for Admin Features (User Management)
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    
    N8N_ENCRYPTION_KEY=your_encryption_key
    ```
    
    
4. **Admin Configuration**

   Kizuna v0.13.0 introduces a dedicated **User Management** panel. To access this, you must have the `admin` role.

   **For New Installations:**
   After running the application for the first time, sign up (`/login` -> Sign Up) to create your first user. Then, run the SQL command below to promote this user to Admin.

   **For Existing Users (Updating from < v0.13.0):**
   If you have an existing user, simply run the SQL command below with your user's ID.

   **SQL Command (Run in Supabase SQL Editor):**
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('YOUR_USER_UUID_HERE', 'admin')
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```
   *Replace `YOUR_USER_UUID_HERE` with your actual User UID found in the Supabase Dashboard > Authentication > Users table.*

5. **Deployment & Privacy (SEO Configuration)**
   
   Kizuna is designed as a private, secure management tool, not a public content website. Therefore, **indexing by search engines is strictly blocked by default** to ensure privacy.
   
   *   **Why?** As a dashboard application handling sensitive automation data, you generally do not want your login page or application structure appearing in Google search results. Public indexing provides no value for this type of tool and can unnecessarily expose your instance location.
   *   **How?** The application is pre-configured with:
       *   `robots.txt`: Disallows all crawlers (`User-agent: *, Disallow: /`).
       *   `Meta Tags`: Includes `robots: noindex, nofollow` headers on all pages.
   
   This ensures that even if you deploy to a public URL (like `kizuna-production.vercel.app`), search engines will respect these directives and exclude your site from their index.

3.  **Run the application:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Migrations (For Existing Installations)

If you already have a running Kizuna instance and are updating to a newer version, you may need to apply database migrations. These migrations are **safe** and do not delete any data.

### v0.15.1 - RLS Policy Optimization

This migration combines multiple permissive SELECT policies on `audit_logs` into a single optimized policy for better query performance.

**Run in Supabase SQL Editor:**
```sql
-- Drop old policies (safe - only removes security rules, not data)
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;

-- Create optimized combined policy
CREATE POLICY "Users and admins can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
    (select auth.uid()) = user_id
    OR
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = (select auth.uid()) 
        AND role = 'admin'
    )
);
```

**Verify the migration:**
```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'audit_logs';
```
You should see only `Users and admins can view audit logs` for SELECT (instead of two separate policies).

---

## Known Issues

### Archived Workflows Not Detected

**Issue:** Workflows that are marked as "Archived" in n8n instances may still appear in Kizuna's workflow list and show as "Inactive" instead of displaying an "Archived" badge.

**Root Cause:**
- The n8n public API (`GET /workflows`) does not include workflow tags in its list response.
- Tags (including "Archived") are only available when fetching each workflow individually via `GET /workflows/{id}`.
- Fetching individual details for every workflow would cause significant performance degradation (N+1 query problem) and is not feasible for servers with many workflows.

**Current Behavior:**
- Archived workflows appear in the "Archived / Inactive" tab.
- They display an "Inactive" toggle instead of an "Archived" badge.
- The badge will appear correctly only if the n8n API includes the `archived` property or tags in the list endpoint in future versions.

**Workaround:**
If you need to identify archived workflows, you can manually check them in the n8n UI or add a custom tag that follows a specific naming convention.

---

## Contributing

We welcome contributions to Kizuna! Please follow these guidelines to ensure a smooth collaboration:

1.  **Branching Strategy**:
    *   **`dev`**: This is the designated development branch. **All** new features, bug fixes, and improvements must be implemented on and targeted to this branch.
    *   **`main`**: This branch is reserved for stable releases only.

2.  **Submitting a Pull Request**:
    *   Please verify that your Pull Request targets the `dev` branch.
    *   PRs targeting `main` will be closed and requested to be re-submitted against `dev`.

---

## Changelog

### v0.15.1 (2026-02-09)
*   **Performance:** Optimized RLS policies for `audit_logs` table - combined multiple permissive SELECT policies into one.
*   **Database:** Added migration instructions for existing installations (see "Database Migrations" section above).
*   **Maintenance:** Improved `setup.sql` with `DROP POLICY` statements for cleaner re-runs.

### v0.15.0 (2026-01-06)
*   **Feature:** Audit Logging System - All critical user actions are now recorded for security and compliance.
*   **Feature:** Activity Log page in Settings - View your action history with filters, pagination, and human-readable labels.
*   **Feature:** Admin users can toggle to view all users' activity logs for oversight.
*   **Performance:** SWR Caching for server status - Intelligent client-side caching with stale-while-revalidate strategy.
*   **Performance:** Automatic cache revalidation when browser tab regains focus.
*   **Performance:** Request deduplication - Multiple components requesting same data trigger only one request.
*   **Database:** New `audit_logs` table with RLS policies and performance indexes (see `setup.sql` Section 6).

### v0.13.2 (2025-12-23)
*   **Fix:** Resolved a React hydration mismatch error on the 'User Management' page related to date rendering.
*   **Maintenance:** Minor performance improvements for date formatting components.

### v0.13.1 (2025-12-23)
*   **Config:** Implemented strict **SEO Blocking** (`noindex`, `nofollow`) for production deployments.
*   **Privacy:** Added dynamic `robots.txt` generator to explicitly disallow all search crawlers.
*   **Rationale:** As a private management application, Kizuna is now configured to prevent search engine indexing by default, ensuring your production instance URL remains private even if publicly accessible.
*   **Documentation:** Added detailed Vercel Deployment Guide (`docs/vercel-workflow.md`).

### v0.13.0 (2025-12-23)
*   **Feature:** Added specialized **Admin 'Manage Users' panel**. Admins can now invite new users directly via email, listing all registered users, and deleting accounts.
*   **Feature:** Added **'My Profile' page** for all users to manage their personal details (Name) and change their password securely.
*   **Security:** Implemented `SERVICE_ROLE_KEY` based architecture for privileged admin operations, ensuring strict separation from client-side actions.
*   **UI/UX:** Added persistent **User Widget** in the sidebar, displaying the user's avatar (initials) and providing quick access to the profile settings.
*   **UI/UX:** Moved the "Not Affiliated" disclaimer to a non-intrusive sticky footer at the bottom of the main layout, improving sidebar aesthetics.
*   **Config:** Updated setup documentation with clear instructions for configuring the Admin role for both new and existing installations.

### v0.12.0 (2025-12-20)
*   **UI/UX:** Added scalable pagination (6 servers/page) and real-time search to dashboard.
*   **UI/UX:** Added pagination (10 workflows/page) and global search filtering to server detail pages.
*   **Settings:** Complete redesign of the Settings area with a modern two-column layout.
*   **Settings:** Added pagination and search functionality for Plugins.
*   **Refactor:** Converted dashboard grids to client-side components for instant interaction.

### v0.11.0 (2025-12-18)
*   **Design:** Major UI overhaul to 'Shadow/Zinc' aesthetic for a premium, clean look distinct from n8n.
*   **Design:** Updated default 'Dark' theme to use Zinc 950/900 palette for deeper contrast.
*   **UX/Legal:** Added clear "Not affiliated with n8n" disclaimers in Sidebar and Login footer.
*   **Styles:** Refined global shadows and card backgrounds for better depth in dark mode.

### v0.10.0 (2025-12-17)
*   **New Feature:** Comprehensive Workflow Version Control System (W-VCS).
*   **New Feature:** "Save Version" allows creating named snapshots with descriptions (vs. just timestamps).
*   **New Feature:** One-click "Restore" to publish any previous version instantly to n8n.
*   **New Feature:** Download specific versions as JSON files.
*   **UI:** Updated terminology to "Published/Unpublished" to align with modern n8n conventions.
*   **Fix:** Addressed strict n8n API validation during restore processes.

### v0.9.1 (2025-12-17)
*   **UI Fix:** Resolved duplicate logo display in Sidebar and Login page.
*   **UI Fix:** Corrected icon misalignment in collapsed sidebar state.
*   **Styles:** Refactored logo container styles to improved utility classes.

### v0.9.0 (2025-12-17)
*   **Performance:** True parallel server loading via dedicated API routes.
*   **Performance:** Each server card now loads independently - slow servers don't block others.
*   **Performance:** Reduced n8n API timeout from 8s to 3s for faster failure detection.
*   **Performance:** Skipped version check on server list (only shown on detail page).
*   **Architecture:** New `/api/server-status` endpoint for non-blocking status fetching.
*   **Fix:** Resolved Next.js server action serialization causing sequential loading.

### v0.8.2 (2025-12-10)
*   **Cleanup:** Removed archive/unarchive functionality due to n8n API limitations.
*   **Cleanup:** Removed unused archiving functions from codebase.
*   **Documentation:** Added "Known Issues" section to README.
*   **Fix:** Case-insensitive tag matching for archived workflow detection.

### v0.8.1 (2025-12-10)
*   **Performance:** Switched to individual streaming server status for instant dashboard loading.
*   **Refactor:** Removed batch processing to eliminate "waterfall" waiting times.
*   **Cleanup:** Code optimization for ServerCard and actions.

### v0.8.0 (2025-12-09)
*   **New Plugin:** 'Animated Background' - Geometric particle network background.
*   **Visual:** Implemented global animated background for enhanced aesthetics.
*   **UX:** Auto-refresh on visual plugin toggle for instant feedback.
*   **Logic:** Theme Switcher now reverts to default 'Mint' theme when disabled.
*   **UI:** Updated Login page with new dynamic background and version display.

### v0.7.0 (2025-12-09)
*   **New Feature:** Collapsible Sidebar - Maximize your workspace with a persistent, memory-state sidebar.
*   **Performance:** Dashboard Re-architecture - Non-blocking server loading for instant page rendering.
*   **Performance:** Parallelized n8n status fetching (Basic + Version) for reduced latency.
*   **UX:** Added Latency Indicator (ms) to server cards.
*   **UX:** Improved loading states with blur effects and skeletons.
*   **UX:** Optimized mobile drawer and responsive behavior.

### v0.6.0 (2025-12-08)
*   **New Feature:** GitHub Integration - Push workflows directly to your repository with commit messages.
*   **New Feature:** Archived/Inactive Workflows Tab - dedicated view for non-active workflows.
*   **UI:** "Ghost Mode" styling for inactive workflows to reduce visual clutter.
*   **Security:** Secure storage for Personal Access Tokens (PAT).

### v0.5.1 (2025-12-08)
*   **Security:** Critical update to Next.js v16.0.7 (Patched React2Shell / CVE-2025-55182).
*   **Maintenance:** Dependency security updates.

### v0.5.0 (2025-12-08)
*   **New Feature:** n8n version detection on server detail page.
*   **New Feature:** "Update Available" badge when newer n8n version exists.
*   **Improvement:** Smart version extraction from Sentry config for proxied instances.
*   **Branding:** Added tagline: "One Kizuna. All your automation."
*   **Cleanup:** Code optimization and interface improvements.

### v0.4.0 (2025-12-04)
*   **New Feature:** Delete Server - Added backup download option before deletion.
*   **New Feature:** Backup Download option before server deletion.
*   **New Feature:** Smart backup detection (only shows option if backups exist).
*   **Security:** Completed comprehensive Security Audit (Score: 9.2/10).
*   **Performance:** Simplified ServerCard component, removed debug logs.

### v0.3.1 (2025-12-04)
*   **New Feature:** Added ability to delete servers with confirmation dialog.

### v0.3.0 (2025-12-04)
*   **New Feature:** Added default "Mint" theme.
*   **New Feature:** "Theme Switcher" plugin (Mint, Classic, Ocean).
*   **Security:** Implemented Role-Based Access Control (RBAC) for plugin management.
*   **Security:** Added SSRF protection for server URL validation.
*   **UI:** Updated UI with fresh colors and shadows.

### v0.2.2 (2025-12-04)
*   **Performance:** Optimized Workflow Page load time by lazy-loading full workflow JSON.
*   **Performance:** Improved Server Page performance by disabling detailed workflow fetching.
*   **Performance:** Reduced initial payload size for workflow details.

### v0.2.1 (2025-12-04)
*   **Performance:** Optimized Row Level Security (RLS) policies.
*   **Fix:** Resolved duplicate policy warnings in database schema.
*   **Improvement:** Enhanced database setup script.

### v0.2.0 (2025-12-02)
*   **New Feature:** Plugin System for modular feature management.
*   **New Feature:** Workflow Templates (Save & Deploy).
*   **New Feature:** Cross-Server Cloning.
*   **New Feature:** Private Notes for workflows.
*   **New Feature:** Workflow Backups (JSON + Metadata).
*   **New Feature:** Execution Details Viewer (JSON Inspector).
*   **New Feature:** Advanced Search and Filtering.
*   **Improvement:** Webhook Helper with copy-to-clipboard.

### v0.1.1 (2025-12-01)
*   **Fix:** Mobile menu closing behavior.
*   **UI:** Added page transition progress bar.
*   **UI:** Password visibility toggle on login.
*   **UI:** Improved Sign Out button visibility.
*   **UI:** Added version display and changelog modal.

### v0.1.0 (2025-12-01)
*   **Initial Release:** Multi-server management, monitoring, favorites system, dark/light mode, and secure authentication.