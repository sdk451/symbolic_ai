# Local Development Setup Guide

This guide will help you set up a complete local development environment for the Symbolic AI Website project.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download from git-scm.com](https://git-scm.com/)

## Quick Start

### Option 1: Automated Setup (Recommended)

#### Windows (PowerShell)
```powershell
# Run the setup script
.\scripts\setup-dev.ps1

# Start development environment
.\scripts\start-dev.ps1
```

#### macOS/Linux (Bash)
```bash
# Run the setup script
./scripts/setup-dev.sh

# Start development environment
./scripts/start-dev.sh
```

### Option 2: Manual Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd symbolic_ai_website
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit .env.local with your actual values
   # Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```

3. **Install Development Tools**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Install Netlify CLI
   npm install -g netlify-cli
   ```

4. **Start Supabase Locally**
   ```bash
   supabase start
   ```

5. **Start Development Servers**
   ```bash
   # Start everything at once
   npm run dev:full
   
   # Or start individually
   npm run dev          # Vite dev server only
   npm run dev:netlify  # Netlify Functions only
   ```

## Development URLs

Once everything is running, you'll have access to:

- **Frontend Application**: http://localhost:3000
- **Netlify Functions**: http://localhost:8888
- **Supabase Studio**: http://localhost:54323
- **Supabase API**: http://localhost:54321
- **Supabase Database**: postgresql://postgres:postgres@localhost:54322/postgres

## Available Scripts

### Development
- `npm run dev` - Start Vite development server
- `npm run dev:netlify` - Start Netlify Functions server
- `npm run dev:full` - Start both Vite and Netlify servers concurrently

### Building
- `npm run build` - Build for production
- `npm run build:analyze` - Build with bundle analysis
- `npm run preview` - Preview production build locally

### Testing
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking

### Utilities
- `npm run setup` - Install dependencies and run type check
- `npm run clean` - Clean build artifacts
- `npm start` - Alias for `npm run dev`

## Environment Variables

### Option 1: Local Supabase (Recommended for Development)

For local development with a local Supabase instance:

```bash
# Run the setup script
.\scripts\setup-local-supabase.ps1
```

This creates a `.env.local` file with:
```env
# Supabase Configuration (Local Instance)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>

# Development Configuration
VITE_APP_ENV=development
VITE_APP_DEBUG=true

# API Configuration
VITE_API_BASE_URL=http://localhost:8888/.netlify/functions
```

### Option 2: Remote Supabase (For Testing Database Functions)

For testing with a real Supabase instance:

```bash
# Run the setup script
.\scripts\setup-remote-supabase.ps1
```

This will prompt you for your Supabase project URL and anon key, then create the appropriate `.env.local` file.

**Important**: You'll need to create the `consultation_requests` table in your remote Supabase instance. Run the SQL script in `scripts/create-consultation-table.sql` in your Supabase SQL Editor.

### Optional Variables

```env
# Analytics (disabled for local development)
# VITE_POSTHOG_KEY=
# VITE_POSTHOG_HOST=

# Email Service (disabled for local development)
# VITE_EMAIL_SERVICE_URL=
```

## Database Setup

### Local Supabase

The project uses Supabase for local development. The configuration is in `supabase/config.toml`.

**Start Supabase:**
```bash
supabase start
```

**Stop Supabase:**
```bash
supabase stop
```

**Reset Database:**
```bash
supabase db reset
```

**View Database:**
- Open Supabase Studio at http://localhost:54323
- Or connect directly: `postgresql://postgres:postgres@localhost:54322/postgres`

### Migrations

Database migrations are located in `supabase/migrations/`. They run automatically when you start Supabase.

## Project Structure

```
├── src/                    # Source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configurations
│   └── services/          # API services
├── netlify/
│   └── functions/         # Netlify Functions (API)
├── supabase/
│   ├── config.toml        # Supabase configuration
│   └── migrations/        # Database migrations
├── scripts/               # Development scripts
├── docs/                  # Documentation
└── public/                # Static assets
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000, 54321, 54322, 54323, 8888
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   ```

2. **Supabase Won't Start**
   ```bash
   # Reset Supabase
   supabase stop
   supabase start
   
   # Or reset database
   supabase db reset
   ```

3. **Environment Variables Not Loading**
   - Ensure `.env.local` exists and has correct format
   - Restart development server after changes
   - Check for typos in variable names

4. **TypeScript Errors**
   ```bash
   # Run type check
   npm run type-check
   
   # Check for missing dependencies
   npm install
   ```

5. **Build Failures**
   ```bash
   # Clean and rebuild
   npm run clean
   npm install
   npm run build
   ```

### Getting Help

- Check the [Supabase CLI documentation](https://supabase.com/docs/guides/cli)
- Check the [Netlify CLI documentation](https://docs.netlify.com/cli/)
- Check the [Vite documentation](https://vitejs.dev/)
- Review project documentation in `docs/` folder

## Performance Tips

### Development Server
- Use `npm run dev:full` for full-stack development
- Use `npm run dev` for frontend-only development
- Hot reloading is enabled for fast development

### Build Optimization
- Production builds are optimized with code splitting
- Source maps are enabled for debugging
- Bundle analysis available with `npm run build:analyze`

### Database Performance
- Local Supabase uses PostgreSQL 15
- Indexes are created for common queries
- Connection pooling is configured

## Security Notes

- Never commit `.env.local` to version control
- Use `.env.example` as a template
- Local Supabase uses demo credentials (safe for development)
- Production credentials should be set in deployment environment

## Next Steps

After setting up the development environment:

1. Review the [Architecture Documentation](architecture.md)
2. Check the [Coding Standards](architecture/coding-standards.md)
3. Explore the [User Stories](stories/) for development tasks
4. Start with [Story 1.1: User Auth & Onboarding](stories/epic-1-story-1-user-auth-onboarding.md)
