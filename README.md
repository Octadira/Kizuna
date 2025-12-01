# n8Kizuna - n8n Dashboard

n8Kizuna is a modern, responsive web interface for managing and monitoring your n8n servers and workflows.

## Features

- **Multi-Server Management**: Add and manage multiple n8n instances from a single dashboard.
- **Workflow Monitoring**: View active/inactive workflows, execution statistics, and success rates.
- **Favorites**: Pin your most used workflows for quick access.
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

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/n8kizuna.git
   cd n8kizuna
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database:
   Run the SQL commands from `supabase_schema.sql` in your Supabase SQL Editor to create the necessary tables and policies.

5. Run the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser.

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
- **RLS**: Row Level Security ensures that users can only access their own servers and favorites.

## License

MIT
