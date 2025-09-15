# PowerShell script for setting up local development environment
# Run this script to set up the complete local development environment

Write-Host "🚀 Setting up Symbolic AI Website Local Development Environment" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not available. Please install npm." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Check if .env.local exists, if not copy from .env.example
if (-not (Test-Path ".env.local")) {
    Write-Host ""
    Write-Host "📝 Creating .env.local from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ .env.local created. Please update it with your actual values." -ForegroundColor Green
    Write-Host "⚠️  Remember to update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Check if Supabase CLI is installed
Write-Host ""
Write-Host "🔍 Checking Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI version: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Supabase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g supabase
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Supabase CLI" -ForegroundColor Red
        Write-Host "Please install manually: https://supabase.com/docs/guides/cli/getting-started" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Supabase CLI installed successfully" -ForegroundColor Green
    }
}

# Check if Netlify CLI is installed
Write-Host ""
Write-Host "🔍 Checking Netlify CLI..." -ForegroundColor Yellow
try {
    $netlifyVersion = netlify --version
    Write-Host "✅ Netlify CLI version: $netlifyVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Netlify CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g netlify-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Netlify CLI" -ForegroundColor Red
        Write-Host "Please install manually: https://docs.netlify.com/cli/get-started/" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Netlify CLI installed successfully" -ForegroundColor Green
    }
}

# Run type check
Write-Host ""
Write-Host "🔍 Running TypeScript type check..." -ForegroundColor Yellow
npm run type-check

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  TypeScript type check found issues. Please review and fix." -ForegroundColor Yellow
} else {
    Write-Host "✅ TypeScript type check passed" -ForegroundColor Green
}

# Run linting
Write-Host ""
Write-Host "🔍 Running ESLint..." -ForegroundColor Yellow
npm run lint

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  ESLint found issues. Run 'npm run lint:fix' to auto-fix some issues." -ForegroundColor Yellow
} else {
    Write-Host "✅ ESLint check passed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.local with your actual Supabase credentials" -ForegroundColor White
Write-Host "2. Start Supabase locally: supabase start" -ForegroundColor White
Write-Host "3. Start the development server: npm run dev" -ForegroundColor White
Write-Host "4. Or start everything at once: npm run dev:full" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see docs/development-setup.md" -ForegroundColor Cyan
