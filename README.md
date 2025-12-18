# Kizuna - One Kizuna. All your automation.

![Version](https://img.shields.io/badge/version-0.11.0-blue.svg)
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

![Kizuna Dashboard](public/hero.png)

## Unlock the Full Potential of Your Automation Infrastructure

**Kizuna** is the centralized control plane for your n8n ecosystem. Designed for power users and DevOps teams, it bridges the gap between scattered n8n instances, offering a unified interface for monitoring, management, and secure orchestration.

Stop juggling multiple tabs and credentials. With Kizuna, you gain a "single pane of glass" visibility into your entire automation landscape, ensuring your workflows are always running, secure, and optimized.

---

## Key Features

### 🚀 Centralized Management
*   **Multi-Server Dashboard:** Monitor the health and status of unlimited n8n instances from one view.
*   **Lightning Fast Loading:** Optimized non-blocking dashboard with individual server status streaming.
*   **True Parallel Loading:** Each server card loads independently - slow servers don't block others.
*   **Real-Time Analytics:** Track active workflows, execution counts, server latency, and uptime instantly.
*   **n8n Version Detection:** See the running n8n version and get notified when updates are available.
*   **Delete Server with Backup:** Safely remove servers with optional backup download.

### ⚡ Seamless Orchestration
*   **Collapsible Sidebar:** Smart workspace management with memory state for persistent layout preference.
*   **Advanced Version Control (W-VCS):** Enterprise-grade versioning for n8n workflows. Save unlimited named versions ("snapshots") of any workflow, download them as JSON, or **restore** them instantly with one click.
    > **The Ultimate Safety Net:** While n8n's native history lives on your server, Kizuna acts as an immutable external vault. Your workflow snapshots are stored securely in Kizuna's managed cloud (or your private infrastructure for Enterprise), ensuring zero data loss even if your n8n instance crashes, is reset, or migrated.
*   **Cross-Server Cloning:** Copy workflows directly from one server to another with a single click.
*   **Workflow Templates:** Save your best workflows as templates and deploy them anywhere.
*   **GitHub Integration:** Direct "Push to GitHub" for workflow versioning with commit messages.

### 🛡️ Enterprise-Grade Security
*   **Role-Based Access Control (RBAC):** Granular permissions for plugin management and server access.
*   **Secure Credential Storage:** Industry-standard AES-256 encryption for all API keys.
*   **SSRF Protection:** Built-in safeguards against Server-Side Request Forgery attacks.
*   **Security Audit:** Comprehensive security review (Score: 9.2/10).

### 🎨 Personalized Experience
*   **Plugin System:** Extend functionality with modular plugins.
*   **Theme Engine:** Choose your vibe with built-in themes (Mint, Classic, Ocean) and Dark/Light mode support.
*   **Private Notes:** Attach context and documentation directly to your workflows.

---

## Getting Started

### Prerequisites
*   Node.js 18+
*   Supabase project (or local instance)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/kizuna.git
    cd kizuna
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    N8N_ENCRYPTION_KEY=your_encryption_key
    ```

4.  **Run the application:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## Changelog

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