# n8Kizuna - n8n Dashboard

n8Kizuna is a modern, responsive web interface for managing and monitoring your n8n servers and workflows.

## Features

- **Multi-Server Management**: Add and manage multiple n8n instances from a single dashboard.
- **Workflow Monitoring**: View active/inactive workflows, execution statistics, and success rates.
- **Favorites**: Pin your most used workflows for quick access.
- **Workflow Notes**: Add personal notes to your workflows for better organization.
- **Workflow Backups**: Save and restore workflow versions with Supabase Storage.
- **Plugin System**: Extend functionality with features like Workflow Templates and Cross-Server Cloning.
- **Secure**: Built with Supabase Authentication and Row Level Security (RLS) to ensure your data is private.
- **Responsive Design**: Fully optimized for desktop and mobile devices.
- **Dark/Light Mode**: Choose your preferred theme.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/n8kizuna.git
   cd n8kizuna
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database:**
   
   Run the unified setup script in your Supabase SQL Editor:
   
   a. Log in to your [Supabase Dashboard](https://app.supabase.com)
   
   b. Navigate to your project
   
   c. Go to **SQL Editor** in the left sidebar
   
   d. Click **New Query**
   
   e. Copy the entire contents of `setup.sql` and paste it into the editor
   
   f. Click **Run** to execute the script
   
   **What's included in the setup:**
   - **6 Tables**: servers, favorites, workflow_notes, workflow_backups, plugins, workflow_templates
   - **15 Security Policies**: Comprehensive Row Level Security for all tables
   - **3 Performance Indexes**: Optimized for user and server queries
   - **Storage Bucket**: Private bucket for workflow backups
   - **Default Plugins**: Workflow Templates and Cross-Server Cloning (disabled by default)

5. **Verify the database setup:**
   
   After running the script, verify that everything was created:
   - Go to **Table Editor** - you should see all 6 tables
   - Go to **Authentication** > **Policies** - you should see RLS policies for each table
   - Go to **Storage** - you should see a 'backups' bucket

6. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser.

## Database Schema

The application uses the following database structure:

### Core Tables
- **servers**: Stores n8n server configurations (name, URL, API key)
- **favorites**: User's favorite workflows for quick access

### Extended Features
- **workflow_notes**: Personal notes attached to specific workflows
- **workflow_backups**: Metadata for workflow backups stored in Supabase Storage

### Plugin System
- **plugins**: Feature management system (toggleable features)
- **workflow_templates**: Reusable workflow templates that can be deployed across servers

All tables have Row Level Security (RLS) enabled, ensuring users can only access their own data.

## Deployment

### Deploy on Vercel

The easiest way to deploy n8Kizuna is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add the following Environment Variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Security

- **API Keys**: n8n API keys are encrypted before being stored in the database.
- **Row Level Security (RLS)**: All tables use RLS policies to ensure users can only access their own data.
- **Storage Access**: Backup files are private and only accessible by the owner.
- **Authentication**: Built on Supabase Auth with secure session management.

## Troubleshooting

### Database Setup Issues

**Storage Policies Error:**
If you get an error with storage policies, you may need to create the storage bucket manually:
1. Go to **Storage** in Supabase Dashboard
2. Create a new bucket called `backups`
3. Set it to **Private**
4. Re-run the storage policy section of the setup script

**Policy Conflicts:**
The setup script includes `DROP POLICY IF EXISTS` statements that will clean up old policies automatically. The script is idempotent and safe to run multiple times.

## Project Structure

```
n8Kizuna/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/             # Utility functions and Supabase client
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── setup.sql            # Unified database setup script
└── README.md            # This file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Version History

- **v1.0.0** (2025-12-03): Initial release with unified database schema
  - Multi-server management
  - Workflow favorites and monitoring
  - Notes and backup system
  - Plugin architecture
  - Comprehensive security with RLS
