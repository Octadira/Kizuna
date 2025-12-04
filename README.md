# n8Kizuna - The Ultimate n8n Command Center

![Version](https://img.shields.io/badge/version-0.4.0-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

![n8Kizuna Dashboard](pbl/hero.png)

## Unlock the Full Potential of Your Automation Infrastructure

**n8Kizuna** is the centralized control plane for your n8n ecosystem. Designed for power users and DevOps teams, it bridges the gap between scattered n8n instances, offering a unified interface for monitoring, management, and secure orchestration.

Stop juggling multiple tabs and credentials. With n8Kizuna, you gain a "single pane of glass" visibility into your entire automation landscape, ensuring your workflows are always running, secure, and optimized.

---

## Key Features

### 🚀 Centralized Management
*   **Multi-Server Dashboard:** Monitor the health and status of unlimited n8n instances from one view.
*   **Real-Time Analytics:** Track active workflows, execution counts, and server uptime instantly.
*   **Delete Server with Backup:** Safely remove servers with optional backup download.

### ⚡ Seamless Orchestration
*   **Cross-Server Cloning:** Copy workflows directly from one server to another with a single click.
*   **Workflow Templates:** Save your best workflows as templates and deploy them anywhere.
*   **Smart Backups:** Automatically backup workflows with metadata and version history.

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
    git clone https://github.com/yourusername/n8kizuna.git
    cd n8kizuna
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

## Changelog

### v0.4.0 (2025-12-04)
*   **New Feature:** Improved Delete Server - moved to server detail page for better UX.
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